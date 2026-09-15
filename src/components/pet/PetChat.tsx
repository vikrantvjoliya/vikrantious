import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { askCompanion, type ChatMessage } from "./chat";

export type PetState = "idle" | "thinking" | "talking";
export default function PetChat({
  name,
  onState,
  onReply,
}: {
  name: string;
  onState: (state: PetState) => void;
  onReply: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState<ChatMessage[] | null>(null);
  const active = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const log = useRef<HTMLDivElement>(null);
  useEffect(
    () => () => {
      active.current?.abort();
      clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, busy, error]);

  const send = async (history?: ChatMessage[]) => {
    if (active.current || (!history && !draft.trim())) return;
    if (!user) {
      setError("Sign in to chat with your companion.");
      return;
    }
    const next = history || [
      ...messages,
      { role: "user" as const, content: draft.trim() },
    ];
    const controller = new AbortController();
    active.current = controller;
    clearTimeout(timer.current);
    setMessages(next);
    setDraft("");
    setError("");
    setRetry(null);
    setBusy(true);
    onState("thinking");
    const timeout = setTimeout(() => controller.abort("timeout"), 40000);
    try {
      const reply = await askCompanion(next, controller.signal);
      if (controller.signal.aborted) return;
      setMessages(
        [...next, { role: "assistant" as const, content: reply }].slice(-40),
      );
      onState("talking");
      onReply();
      timer.current = setTimeout(() => onState("idle"), 2600);
    } catch (cause) {
      if (controller.signal.aborted && controller.signal.reason !== "timeout")
        return;
      setError(
        controller.signal.aborted
          ? "The response took too long. Try again."
          : cause instanceof Error
            ? cause.message
            : "Connection failed. Try again.",
      );
      setRetry(next);
      onState("idle");
    } finally {
      clearTimeout(timeout);
      if (active.current === controller) {
        active.current = null;
        setBusy(false);
      }
    }
  };
  const cancel = () => {
    active.current?.abort();
    active.current = null;
    setBusy(false);
    onState("idle");
    setError("Response stopped.");
    setRetry(messages);
  };
  return (
    <div className="pet-chat">
      <div
        className="pet-chat-log"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        ref={log}
      >
        {!messages.length && (
          <div className="pet-chat-welcome">
            <span>✦</span>
            <h3>A little help, a little company.</h3>
            <p>I’m {name}. Bring a question, an idea, or a blank page.</p>
            <p className="pet-chat-note">
              Messages are sent to AI when you press Send. This chat stays in
              this session.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div className={`pet-message ${message.role}`} key={index}>
            <span>{message.role === "user" ? "You" : name}</span>
            <p>{message.content}</p>
          </div>
        ))}
        {busy && (
          <p className="pet-thinking" role="status">
            {name} is thinking <span>● ● ●</span>
          </p>
        )}
      </div>
      {error && (
        <div className="pet-chat-error" role="alert">
          {error} {!user && <Link to="/login">Sign in</Link>}{" "}
          {retry && !busy && (
            <button onClick={() => void send(retry)}>Retry response</button>
          )}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <label className="pet-sr-only" htmlFor="pet-message">
          Message your companion
        </label>
        <textarea
          id="pet-message"
          placeholder="What’s on your mind?"
          maxLength={2000}
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <div className="pet-composer-actions">
          <small>{draft.length}/2000 · Shift + Enter for a new line</small>
          {busy ? (
            <button type="button" onClick={cancel}>
              Stop response
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim()}
            >
              Send ↗
            </button>
          )}
        </div>
      </form>
      <button
        className="pet-clear"
        disabled={busy || !messages.length}
        onClick={() => {
          setMessages([]);
          setRetry(null);
          setError("");
        }}
      >
        Clear conversation
      </button>
    </div>
  );
}
