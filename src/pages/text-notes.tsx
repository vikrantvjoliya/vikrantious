import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { supabase } from "../utils/supabaseClient";
import { useGuestAuth } from "../utils/useGuestAuth";
import PageHeading from "../components/PageHeading";
type Note = { id: number; content: string; created_at: string };
export default function TextNotesPage() {
  const userId = useGuestAuth();
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("text_notes")
        .select("id, content, created_at")
        .eq("user_id", userId)
        .order("id", { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch {
      setError("Couldn’t load your notes. Please try again.");
    } finally {
      setFetching(false);
    }
  }, [userId]);
  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);
  const save = async () => {
    if (!userId || !note.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result =
        editing === null
          ? await supabase
              .from("text_notes")
              .insert({ user_id: userId, content: note.trim() })
          : await supabase
              .from("text_notes")
              .update({ content: note.trim() })
              .eq("id", editing)
              .eq("user_id", userId)
              .select("id")
              .single();
      if (result.error) throw result.error;
      setNote("");
      setEditing(null);
      setMessage("Your note is saved.");
      await fetchNotes();
    } catch {
      setError(
        "Couldn’t save your note. Your draft is still here — please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: number) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase
        .from("text_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .single();
      if (error) throw error;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (editing === id) {
        setEditing(null);
        setNote("");
      }
    } catch {
      setError("Couldn’t delete the note. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const filtered = notes.filter((n) =>
    (n.content || "").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="content-page">
      <PageHeading
        title="Put it into words."
        description="An open page for the things on your mind."
      />
      {error && (
        <Alert
          className="status-message"
          severity="error"
          action={<Button onClick={fetchNotes}>Retry</Button>}
        >
          {error}
        </Alert>
      )}
      {message && (
        <Alert
          className="status-message"
          severity="success"
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}
      <div className="editor-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>{editing === null ? "A new thought" : "Edit your note"}</h2>
            <DescriptionOutlined color="primary" />
          </div>
          <TextField
            label="What’s on your mind?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={9}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 20000 } }}
            disabled={busy}
          />
          <div className="editor-actions">
            <span className="muted">
              {note.length.toLocaleString()} / 20,000
            </span>
            <div>
              {editing !== null && (
                <Button
                  disabled={busy}
                  onClick={() => {
                    setEditing(null);
                    setNote("");
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                onClick={save}
                disabled={!note.trim() || busy}
              >
                {busy
                  ? "Saving…"
                  : editing === null
                    ? "Save note"
                    : "Save changes"}
              </Button>
            </div>
          </div>
        </section>
        <section>
          <div className="panel-heading">
            <h2>
              Your notes <span className="muted">({notes.length})</span>
            </h2>
          </div>
          <TextField
            label="Search your notes"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="note-list">
            {fetching ? (
              <CircularProgress size={24} aria-label="Loading notes" />
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <DescriptionOutlined />
                <h2>{search ? "No matching notes" : "A fresh page awaits."}</h2>
                <p>
                  {search
                    ? "Try another word or phrase."
                    : "Your saved thoughts will find a home here."}
                </p>
              </div>
            ) : (
              filtered.map((n) => (
                <article className="saved-note" key={n.id}>
                  <p>{n.content}</p>
                  <div className="note-meta">
                    <span>
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div>
                      <IconButton
                        size="small"
                        aria-label="Edit note"
                        disabled={busy}
                        onClick={() => {
                          setEditing(n.id);
                          setNote(n.content || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Delete note"
                        disabled={busy}
                        onClick={() => remove(n.id)}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
