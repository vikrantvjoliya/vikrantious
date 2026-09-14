import { useState, type FormEvent } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { Link, Navigate, useLocation } from "react-router-dom";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { supabase, isSupabaseConfigured } from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const destination = ["/text-notes", "/drawing-notes", "/file-notes"].includes(
    from,
  )
    ? from
    : "/";
  if (user) return <Navigate to={destination} replace />;
  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error)
        setError(
          "We couldn’t sign you in. Check your email and password and try again.",
        );
    } catch {
      setError("Unable to connect. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-layout">
      <div className="login-story">
        <span className="eyebrow">YOUR PERSONAL CORNER OF THE INTERNET</span>
        <h1>
          Pick up where
          <br />
          you <em>left off.</em>
        </h1>
        <p>
          A home for your thoughts.
          <br />A canvas for your imagination.
          <br />A little space, just for you.
        </p>
        <span className="login-star" aria-hidden="true">
          ✳
        </span>
      </div>
      <section className="login-card">
        <span className="tool-icon green">
          <LockOutlined />
        </span>
        <h2>Welcome to your workspace</h2>
        <p>Sign in to access your notes, drawings, and files.</p>
        <form onSubmit={login}>
          <TextField
            label="Email address"
            type="email"
            autoComplete="username"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isSupabaseConfigured && (
            <Alert severity="warning">
              Workspace connection is not configured yet. Please contact the
              site owner.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isSupabaseConfigured}
          >
            {loading ? "Signing in…" : "Sign in to workspace"}
          </Button>
        </form>
        <p className="login-help">
          Need access or a password reset? Contact the workspace owner.
        </p>
        <Link className="back-link" to="/">
          <ArrowBackRounded fontSize="small" /> Back to overview
        </Link>
      </section>
    </div>
  );
}
