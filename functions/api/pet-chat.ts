type Environment = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
};
type Message = { role: "user" | "assistant"; content: string };
const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
};
const json = (body: object, status = 200) =>
  Response.json(body, { status, headers });

/** Dependency injection only at the network boundary allows real handler tests. */
export async function handlePetChat(
  request: Request,
  env: Environment,
  network: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin)
    return json({ error: "Origin not allowed." }, 403);
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer \S+$/i.test(authorization) || authorization.length > 8192)
    return json({ error: "Sign in to use AI chat." }, 401);
  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_ANON_KEY ||
    !env.OPENAI_API_KEY ||
    !env.OPENAI_MODEL
  )
    return json(
      { error: "AI chat is not configured on this deployment yet." },
      503,
    );
  if (Number(request.headers.get("Content-Length")) > 26000)
    return json({ error: "Conversation is too large." }, 413);
  let messages: Message[];
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "A message is required." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 26000) {
        await reader.cancel();
        return json({ error: "Conversation is too large." }, 413);
      }
      chunks.push(value);
    }
    const raw = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      raw.set(chunk, offset);
      offset += chunk.length;
    }
    const payload = JSON.parse(new TextDecoder().decode(raw));
    if (
      !Array.isArray(payload?.messages) ||
      !payload.messages.length ||
      payload.messages.length > 12
    )
      return json({ error: "Send between 1 and 12 messages." }, 400);
    messages = payload.messages.map((message: Message) => {
      if (
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() ||
        message.content.length > 2000
      )
        throw new Error("Invalid message");
      return { role: message.role, content: message.content.trim() };
    });
    if (
      messages.at(-1)?.role !== "user" ||
      messages.reduce((n, m) => n + m.content.length, 0) > 10000
    )
      return json(
        {
          error:
            "Conversation is too long or missing a question. Start a new conversation.",
        },
        400,
      );
  } catch {
    return json({ error: "Invalid chat request." }, 400);
  }
  try {
    const authUrl = new URL("/auth/v1/user", env.SUPABASE_URL);
    if (authUrl.protocol !== "https:")
      return json(
        { error: "Chat authentication is not configured correctly." },
        503,
      );
    const auth = await network(authUrl.toString(), {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: authorization },
      signal: AbortSignal.timeout(8000),
    });
    if (!auth.ok)
      return json({ error: "Your session expired. Sign in again." }, 401);
    const user = (await auth.json()) as { id?: string };
    if (!user.id) return json({ error: "Sign in to use AI chat." }, 401);
    const response = await network("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        store: false,
        max_output_tokens: 1000,
        instructions:
          "You are a friendly virtual companion on Vikrant’s personal website. Help with questions, writing, and planning. Be concise and warm. You cannot access private notes, files, accounts, or take actions. Do not claim that you have. Return plain text.",
        input: messages,
      }),
    });
    if (response.status === 429)
      return json({ error: "Chat is busy. Please try again shortly." }, 429);
    if (!response.ok)
      return json(
        { error: "The AI service is unavailable. Please try again." },
        502,
      );
    const result = (await response.json()) as {
      output?: {
        type: string;
        content?: { type: string; text?: string; refusal?: string }[];
      }[];
    };
    const reply = result.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content || [])
      .map((part) =>
        part.type === "output_text"
          ? part.text || ""
          : part.type === "refusal"
            ? part.refusal || ""
            : "",
      )
      .join("\n")
      .trim();
    if (!reply)
      return json(
        { error: "No response arrived. Try a shorter question." },
        502,
      );
    return json({ reply });
  } catch {
    return json(
      { error: "Chat could not connect or timed out. Please try again." },
      502,
    );
  }
}

export const onRequest = ({
  request,
  env,
}: {
  request: Request;
  env: Environment;
}) => handlePetChat(request, env);
