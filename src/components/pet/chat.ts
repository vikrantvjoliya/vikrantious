import { supabase } from "../../utils/supabaseClient";
export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function askCompanion(
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  if (!data.session) throw new Error("Sign in to chat with your companion.");
  const context = messages
    .slice(-12)
    .map((message) => ({
      ...message,
      content: message.content.slice(0, 2000),
    }));
  while (
    context.length > 1 &&
    (context.reduce((length, message) => length + message.content.length, 0) >
      10000 ||
      new TextEncoder().encode(JSON.stringify({ messages: context })).length >
        26000)
  )
    context.shift();
  const response = await fetch("/api/pet-chat", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({ messages: context }),
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("AI chat is not configured on this deployment yet.");
  }
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Chat is unavailable. Please try again.");
  if (typeof result.reply !== "string" || !result.reply.trim())
    throw new Error("No response arrived. Please try again.");
  return result.reply;
}
