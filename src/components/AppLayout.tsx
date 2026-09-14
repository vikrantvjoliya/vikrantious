import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import NavBar from "./NavBar";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#27634b" },
    secondary: { main: "#a5643c" },
    background: { default: "#f8f9f6", paper: "#ffffff" },
    text: { primary: "#242c28", secondary: "#737b75" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { padding: "10px 20px" } },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "none", border: "1px solid #e4e8e1" },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { background: "#fff" } } },
  },
});
const names: Record<string, string> = {
  "/": "Overview",
  "/text-notes": "Text notes",
  "/drawing-notes": "Drawing studio",
  "/file-notes": "Files",
  "/suika-game": "Fruity Fall",
  "/login": "Sign in",
};
export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [logoutError, setLogoutError] = useState(false);
  const logout = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    setLogoutError(Boolean(error));
    setAnchor(null);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="app-shell">
        <NavBar />
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>{names[pathname] || "Page not found"}</strong>
            </div>
            <div className="topbar-right">
              <span className="personal-label">
                <i /> A little space for big ideas
              </span>
              {user ? (
                <button
                  className="avatar avatar-button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={Boolean(anchor)}
                  onClick={(e) => setAnchor(e.currentTarget)}
                >
                  {user.email?.[0].toUpperCase() || "V"}
                </button>
              ) : (
                <Link className="signin-link" to="/login">
                  Sign in <ArrowOutward fontSize="small" />
                </Link>
              )}
            </div>
          </header>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
          >
            <MenuItem onClick={logout}>Sign out</MenuItem>
          </Menu>
          {logoutError && (
            <Alert severity="error" onClose={() => setLogoutError(false)}>
              Couldn’t sign out. Please try again.
            </Alert>
          )}
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="footer">
            <span>
              Vikrantious <span className="footer-dot">·</span> Your mind, a
              little clearer.
            </span>
            <span>Made for the everyday.</span>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}
