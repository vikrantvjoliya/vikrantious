import { useRef, useState, type PointerEvent } from "react";
import { Alert, Button } from "@mui/material";
import { supabase } from "../utils/supabaseClient";
import { useGuestAuth } from "../utils/useGuestAuth";
import PageHeading from "../components/PageHeading";
const colors = ["#35543b", "#3d4756", "#b97855", "#8d7eac", "#7397b0"];
export default function DrawingNotesPage() {
  const userId = useGuestAuth();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(3);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      ((event.clientX - rect.left) * event.currentTarget.width) / rect.width,
      ((event.clientY - rect.top) * event.currentTarget.height) / rect.height,
    ];
  };
  const start = (e: PointerEvent<HTMLCanvasElement>) => {
    if (busy) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setDirty(true);
    setMessage("");
    const [x, y] = point(e);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvas.current?.getContext("2d");
    const [x, y] = point(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };
  const clear = () => {
    if (
      dirty &&
      !window.confirm("Clear the canvas? Unsaved marks will be lost.")
    )
      return;
    const ctx = canvas.current?.getContext("2d");
    ctx?.clearRect(0, 0, 1000, 600);
    setDirty(false);
    setMessage("");
  };
  const save = async () => {
    if (!canvas.current || !userId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.current!.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Canvas unavailable");
      const { error } = await supabase.storage
        .from("notes-files")
        .upload(`${userId}/drawings/canvas.png`, blob, {
          upsert: true,
          contentType: "image/png",
        });
      if (error) throw error;
      setDirty(false);
      setMessage("Drawing saved. You can load it next time you’re here.");
    } catch {
      setError(
        "Couldn’t save your drawing. Your canvas is still here — try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const load = async () => {
    if (
      dirty &&
      !window.confirm(
        "Replace the canvas with your saved drawing? Unsaved marks will be lost.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data, error } = await supabase.storage
        .from("notes-files")
        .download(`${userId}/drawings/canvas.png`);
      if (error || !data) throw error;
      const bitmap = await createImageBitmap(data);
      const ctx = canvas.current?.getContext("2d");
      ctx?.clearRect(0, 0, 1000, 600);
      ctx?.drawImage(bitmap, 0, 0);
      bitmap.close();
      setDirty(false);
      setMessage("Your saved drawing is ready.");
    } catch {
      setError(
        "Couldn’t load a saved drawing. Save your first drawing, or try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="content-page">
      <PageHeading
        title="Think outside the lines."
        description="Follow a thought. Make a mark. See where it takes you."
      />
      {error && (
        <Alert className="status-message" severity="error">
          {error}
        </Alert>
      )}
      {message && (
        <Alert className="status-message" severity="success">
          {message}
        </Alert>
      )}
      <section className="panel">
        <div className="drawing-toolbar">
          {colors.map((c) => (
            <button
              key={c}
              disabled={busy}
              className={`color-button ${color === c ? "selected" : ""}`}
              style={{ background: c }}
              aria-label={`Ink color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
            />
          ))}
          <label
            className="muted"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginLeft: 8,
            }}
          >
            Brush{" "}
            <input
              type="range"
              min={1}
              max={12}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: 70, accentColor: "#35543b" }}
            />
          </label>
          <div style={{ flex: 1 }} />
          <Button disabled={busy} onClick={clear}>
            Clear
          </Button>
          <Button disabled={busy} onClick={load}>
            Load saved
          </Button>
          <Button variant="contained" disabled={busy} onClick={save}>
            {busy ? "Please wait…" : "Save drawing"}
          </Button>
        </div>
        <canvas
          ref={canvas}
          width={1000}
          height={600}
          className="drawing-surface"
          aria-label="Drawing canvas. Use your mouse, touch screen, or pen to draw."
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={() => {
            drawing.current = false;
          }}
          onPointerCancel={() => {
            drawing.current = false;
          }}
        />
        <p className="drawing-hint">
          Use a mouse, touch, or pen · Save keeps your latest canvas
        </p>
      </section>
    </div>
  );
}
