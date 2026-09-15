import { test, expect } from "@playwright/test";

test("chat rejects oversized and cross-origin payloads and hides upstream errors", async () => {
  const { handlePetChat } = await import("../functions/api/pet-chat");
  const env = {
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "public",
    OPENAI_API_KEY: "secret",
    OPENAI_MODEL: "configured-model",
  };
  const network: typeof fetch = async (url) =>
    String(url).endsWith("/auth/v1/user")
      ? Response.json({ id: "real-user" })
      : Response.json({ error: "sensitive provider details" }, { status: 500 });
  const build = (body: string, origin = "https://vikrantvj.com") =>
    new Request("https://vikrantvj.com/api/pet-chat", {
      method: "POST",
      headers: { Origin: origin, Authorization: "Bearer valid" },
      body,
    });
  expect(
    (
      await handlePetChat(
        build("{}", "https://untrusted.example"),
        env,
        network,
      )
    ).status,
  ).toBe(403);
  expect(
    (await handlePetChat(build("x".repeat(27000)), env, network)).status,
  ).toBe(413);
  expect((await handlePetChat(build("{bad"), env, network)).status).toBe(400);
  const response = await handlePetChat(
    build(JSON.stringify({ messages: [{ role: "user", content: "hello" }] })),
    env,
    network,
  );
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain("sensitive");
  expect((await handlePetChat(build("{}"), {}, network)).status).toBe(503);
});

test("chat endpoint denies anonymous and invalid sessions before contacting AI", async () => {
  const { handlePetChat } = await import("../functions/api/pet-chat");
  const env = {
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "public",
    OPENAI_API_KEY: "secret",
    OPENAI_MODEL: "configured-model",
  };
  const request = (token = "") =>
    new Request("https://vikrantvj.com/api/pet-chat", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });
  let calls = 0;
  const unauthorized = async () => {
    calls++;
    return Response.json({ message: "invalid" }, { status: 401 });
  };
  expect((await handlePetChat(request(), env, unauthorized)).status).toBe(401);
  expect(calls).toBe(0);
  expect(
    (await handlePetChat(request("forged"), env, unauthorized)).status,
  ).toBe(401);
  expect(calls).toBe(1);
});

test("chat strips client configuration, rejects injected roles, and extracts provider output", async () => {
  const { handlePetChat } = await import("../functions/api/pet-chat");
  const env = {
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "public",
    OPENAI_API_KEY: "secret",
    OPENAI_MODEL: "configured-model",
  };
  let upstream: Record<string, unknown> | undefined;
  const network: typeof fetch = async (url, init) => {
    if (String(url).endsWith("/auth/v1/user"))
      return Response.json({ id: "real-user" });
    upstream = JSON.parse(String(init?.body));
    return Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: "Let’s make a plan." }],
        },
      ],
    });
  };
  const req = (role: string, content = "Help me") =>
    new Request("https://vikrantvj.com/api/pet-chat", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid",
        Origin: "https://vikrantvj.com",
      },
      body: JSON.stringify({
        model: "attacker-model",
        messages: [{ role, content }],
      }),
    });
  expect((await handlePetChat(req("system"), env, network)).status).toBe(400);
  expect(upstream).toBeUndefined();
  const good = await handlePetChat(req("user"), env, network);
  expect(await good.json()).toEqual({ reply: "Let’s make a plan." });
  expect(upstream?.model).toBe("configured-model");
  expect(upstream?.store).toBe(false);
  expect(good.headers.get("cache-control")).toBe("no-store");
  expect(
    (await handlePetChat(req("user", "a".repeat(2001)), env, network)).status,
  ).toBe(400);
});
