import { useRef, useState, useEffect, useCallback } from "react";
import { Button, Alert, CircularProgress } from "@mui/material";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import { supabase } from "../utils/supabaseClient";
import { useGuestAuth } from "../utils/useGuestAuth";
import {
  validateFile,
  safeFilename,
  displayFilename,
} from "../utils/fileValidation";
import PageHeading from "../components/PageHeading";
type StoredFile = {
  name: string;
  id: string;
  metadata?: { size?: number };
  created_at?: string;
};
export default function FileNotesPage() {
  const userId = useGuestAuth();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<StoredFile[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const folder = `${userId}/documents`;
  const fetchFiles = useCallback(async () => {
    if (!userId) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.storage
        .from("notes-files")
        .list(`${userId}/documents`, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });
      if (error) throw error;
      setFiles((data || []).filter((f) => f.id));
    } catch {
      setError("Couldn’t load your files. Please try again.");
    } finally {
      setFetching(false);
    }
  }, [userId]);
  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);
  const upload = async () => {
    if (!file || !userId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const validation = await validateFile(file);
      if (validation) {
        setError(validation);
        return;
      }
      const { error } = await supabase.storage
        .from("notes-files")
        .upload(
          `${folder}/${crypto.randomUUID()}_${safeFilename(file.name)}`,
          file,
          {
            upsert: false,
            contentType: file.name.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "text/plain",
          },
        );
      if (error) throw error;
      setFile(null);
      if (input.current) input.current.value = "";
      setMessage("Your file is uploaded.");
      await fetchFiles();
    } catch {
      setError("Couldn’t upload this file. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const download = async (name: string) => {
    setBusy(true);
    setError("");
    try {
      const { data, error } = await supabase.storage
        .from("notes-files")
        .download(`${folder}/${name}`);
      if (error || !data) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = displayFilename(name);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Couldn’t download the file. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="content-page">
      <PageHeading
        title="Keep the good stuff."
        description="Your documents, together and easy to find."
      />
      {error && (
        <Alert
          className="status-message"
          severity="error"
          onClose={() => setError("")}
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
      <section className="panel">
        <div className="upload-zone">
          <UploadFileOutlined />
          <h2 style={{ fontSize: 18, fontWeight: 500 }}>
            A home for your documents
          </h2>
          <p>PDF or plain text · Up to 10 MB per file</p>
          <input
            ref={input}
            id="file-upload"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            disabled={busy}
            aria-label="Choose a document"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
            }}
            style={{ maxWidth: "100%", fontSize: 12 }}
          />
          <Button variant="contained" disabled={!file || busy} onClick={upload}>
            {busy ? "Please wait…" : "Upload document"}
          </Button>
        </div>
      </section>
      <div className="section-heading" style={{ marginTop: 30 }}>
        <h2>Your collection</h2>
        <span>Latest 100 documents</span>
      </div>
      {fetching ? (
        <CircularProgress size={24} aria-label="Loading files" />
      ) : files.length === 0 ? (
        <div className="empty-state">
          <DescriptionOutlined />
          <h2>Keep something worth saving.</h2>
          <p>Upload your first document to start your collection.</p>
          <Button onClick={fetchFiles}>Refresh files</Button>
        </div>
      ) : (
        <div className="file-list">
          {files.map((f) => (
            <article className="file-row" key={f.id}>
              <span className="tool-icon lavender">
                <DescriptionOutlined />
              </span>
              <div className="file-info">
                <h3>{displayFilename(f.name)}</h3>
                <p>
                  {Math.max(1, Math.round((f.metadata?.size || 0) / 1024))} KB{" "}
                  {f.created_at &&
                    `· ${new Date(f.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <Button disabled={busy} onClick={() => download(f.name)}>
                Download
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
