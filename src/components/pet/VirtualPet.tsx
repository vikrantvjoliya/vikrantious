import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useAuth } from "../../auth/AuthContext";
import { constrainPet } from "./geometry";
import { usePetSettings } from "./usePetSettings";
import PetArt from "./PetArt";
import PetChat, { type PetState } from "./PetChat";
import "./pet.css";

export default function VirtualPet() {
  const { user } = useAuth();
  const [settings, setSettings] = usePetSettings();
  const [panel, setPanel] = useState<"chat" | "settings" | null>(null);
  const [state, setState] = useState<PetState>("idle");
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    origin: typeof settings;
    resize: boolean;
  } | null>(null);
  const chatButton = useRef<HTMLButtonElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!panel) return;
    panelRef.current
      ?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        panel === "chat" ? "textarea" : ".pet-settings input",
      )
      ?.focus({ preventScroll: true });
  }, [panel]);
  const closePanel = () => {
    (panel === "chat" ? chatButton : settingsButton).current?.focus();
    setPanel(null);
    setState("idle");
  };
  const start = (event: PointerEvent<HTMLButtonElement>, resize: boolean) => {
    if (settings.locked || event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: settings,
      resize,
    };
    setDragging(true);
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x,
      dy = event.clientY - g.y;
    const position = g.resize
      ? { ...g.origin, size: g.origin.size + Math.max(dx, dy / 1.2) }
      : { ...g.origin, x: g.origin.x + dx, y: g.origin.y + dy };
    setSettings((s) => ({ ...s, ...constrainPet(position) }));
  };
  const end = () => {
    gesture.current = null;
    setDragging(false);
  };
  const sound = () => {
    if (settings.muted) return;
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator(),
        gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, audio.currentTime);
      gain.gain.setValueAtTime(0.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.22);
      oscillator.onended = () => {
        void audio.close();
      };
    } catch {
      /* Audio support is optional. */
    }
  };
  if (!settings.enabled)
    return (
      <button
        className="pet-launcher"
        aria-label="Show companion"
        onClick={() =>
          setSettings((s) => ({ ...s, enabled: true, ...constrainPet(s) }))
        }
      >
        <span>✦</span> Companion
      </button>
    );
  const panelWidth = Math.min(350, window.innerWidth - 24);
  const panelLeft = Math.max(
    12,
    Math.min(settings.x - panelWidth - 16, window.innerWidth - panelWidth - 12),
  );
  const panelTop = Math.max(
    12,
    Math.min(settings.y - 100, window.innerHeight - 520),
  );
  return (
    <div
      className="pet-root"
      data-no-bloom="true"
      style={{ "--pet-accent": settings.color } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "Escape") closePanel();
      }}
    >
      <div
        className={`pet-widget ${dragging ? "dragging" : ""} ${settings.motion ? "" : "pet-still"}`}
        data-state={state}
        style={{ left: settings.x, top: settings.y, width: settings.size }}
      >
        <div className="pet-name">
          <i />
          {settings.name || "Rune"}
        </div>
        <button
          className="pet-drag"
          aria-label="Move companion"
          aria-describedby="pet-move-help"
          style={{ height: settings.size * 1.2 }}
          onPointerDown={(event) => start(event, false)}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onLostPointerCapture={end}
          onKeyDown={(event) => {
            if (
              settings.locked ||
              !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                event.key,
              )
            )
              return;
            event.preventDefault();
            setSettings((s) => ({
              ...s,
              ...constrainPet({
                ...s,
                x:
                  s.x +
                  (event.key === "ArrowLeft"
                    ? -10
                    : event.key === "ArrowRight"
                      ? 10
                      : 0),
                y:
                  s.y +
                  (event.key === "ArrowUp"
                    ? -10
                    : event.key === "ArrowDown"
                      ? 10
                      : 0),
              }),
            }));
          }}
        >
          <PetArt character={settings.character} />
        </button>
        <span id="pet-move-help" className="pet-sr-only">
          Drag or use arrow keys to move. Change size in companion settings.
        </span>
        <div className="pet-toolbar">
          <button
            ref={chatButton}
            aria-label="Chat with companion"
            aria-expanded={panel === "chat"}
            onClick={() => {
              setPanel((p) => (p === "chat" ? null : "chat"));
              setState("idle");
            }}
          >
            ✧
          </button>
          <button
            ref={settingsButton}
            aria-label="Companion settings"
            aria-expanded={panel === "settings"}
            onClick={() => {
              setPanel((p) => (p === "settings" ? null : "settings"));
              setState("idle");
            }}
          >
            ⚙
          </button>
          <button
            aria-label="Hide companion"
            onClick={() => {
              setSettings((s) => ({ ...s, enabled: false }));
              setPanel(null);
              setState("idle");
            }}
          >
            ×
          </button>
          <button
            className="pet-resize"
            aria-label="Resize companion"
            disabled={settings.locked}
            onPointerDown={(event) => start(event, true)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={end}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                setSettings((s) => ({
                  ...s,
                  ...constrainPet({
                    ...s,
                    size: s.size + (event.key === "ArrowRight" ? 10 : -10),
                  }),
                }));
              }
            }}
          >
            ⤡
          </button>
        </div>
      </div>
      <section
        ref={panelRef}
        hidden={!panel}
        className="pet-panel"
        role="dialog"
        aria-label={panel === "chat" ? "Companion chat" : "Companion settings"}
        style={{
          left: panelLeft,
          top: panelTop,
          width: panelWidth,
          maxHeight: `calc(100dvh - ${panelTop + 12}px)`,
        }}
      >
        <header>
          <div>
            <span className="pet-panel-eyebrow">YOUR LITTLE COMPANION</span>
            <h2>
              {panel === "chat" ? settings.name || "Rune" : "Make it yours"}
            </h2>
          </div>
          <button aria-label="Close companion panel" onClick={closePanel}>
            ×
          </button>
        </header>
        <div className="pet-chat-container" hidden={panel !== "chat"}>
          <PetChat
            key={user?.id || "guest"}
            name={settings.name || "Rune"}
            onState={setState}
            onReply={sound}
          />
        </div>
        {panel === "settings" && (
          <div className="pet-settings">
            <label>
              Pet name
              <input
                maxLength={24}
                value={settings.name}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, name: event.target.value }))
                }
              />
            </label>
            <label>
              Character
              <select
                value={settings.character}
                onChange={(event) =>
                  setSettings((s) => ({
                    ...s,
                    character: event.target.value as typeof s.character,
                  }))
                }
              >
                <option value="warrior">Rune · little warrior</option>
                <option value="electric">Bolt · electric friend</option>
              </select>
            </label>
            <label className="pet-color-label">
              Accent color
              <input
                type="color"
                value={settings.color}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, color: event.target.value }))
                }
              />
            </label>
            <label>
              Size <small>{Math.round(settings.size)}px</small>
              <input
                type="range"
                min="96"
                max="240"
                value={settings.size}
                onChange={(event) =>
                  setSettings((s) => ({
                    ...s,
                    ...constrainPet({ ...s, size: Number(event.target.value) }),
                  }))
                }
              />
            </label>
            <label className="pet-check">
              <input
                type="checkbox"
                checked={settings.locked}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, locked: event.target.checked }))
                }
              />
              Lock position
            </label>
            <label className="pet-check">
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, muted: event.target.checked }))
                }
              />
              Mute sounds
            </label>
            <label className="pet-check">
              <input
                type="checkbox"
                checked={settings.motion}
                onChange={(event) =>
                  setSettings((s) => ({ ...s, motion: event.target.checked }))
                }
              />
              Animate companion
            </label>
            <p>
              Saved on this browser. Device reduced-motion settings always take
              priority.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
