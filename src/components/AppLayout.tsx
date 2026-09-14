import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  Menu,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import NavBar from "./NavBar";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import ContrastRounded from "@mui/icons-material/ContrastRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import "../themes.css";

type ThemePreference = "system" | "light" | "dark" | "pokemon" | "god-of-war";
function getPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem("vk-theme");
    return saved === "light" ||
      saved === "dark" ||
      saved === "pokemon" ||
      saved === "god-of-war"
      ? saved
      : "system";
  } catch {
    return "system";
  }
}

const makeTheme = (name: Exclude<ThemePreference, "system">) => {
  const dark = name === "dark" || name === "god-of-war";
  const primary =
    name === "pokemon"
      ? "#2a75bb"
      : name === "god-of-war"
        ? "#d75043"
        : dark
          ? "#b7d79c"
          : "#27634b";
  return createTheme({
    palette: {
      mode: dark ? "dark" : "light",
      primary: { main: primary },
      secondary: { main: dark ? "#deb18f" : "#a5643c" },
      background: {
        default: dark ? "#151b18" : "#f8f9f6",
        paper: dark ? "#1d2620" : "#ffffff",
      },
      text: {
        primary: dark ? "#e9eee3" : "#242c28",
        secondary: dark ? "#adb9a8" : "#697461",
      },
      divider: dark ? "#344336" : "#e4e8e1",
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
          root: {
            boxShadow: "none",
            border: `1px solid ${dark ? "#344336" : "#e4e8e1"}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: { root: { background: dark ? "#1d2620" : "#fff" } },
      },
    },
  });
};
const names: Record<string, string> = {
  "/": "Résumé",
  "/workspace": "Overview",
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
  const [preference, setPreference] = useState<ThemePreference>(getPreference);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [themeAnchor, setThemeAnchor] = useState<HTMLElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resolvedTheme: Exclude<ThemePreference, "system"> =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;
  const dark = resolvedTheme === "dark" || resolvedTheme === "god-of-war";
  const theme = useMemo(() => makeTheme(resolvedTheme), [resolvedTheme]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#151b18" : "#f8f9f6");
    try {
      localStorage.setItem("vk-theme", preference);
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }, [dark, preference, resolvedTheme]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [sidebarOpen]);
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
        <NavBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <IconButton
                className="nav-toggle"
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
              >
                <MenuRounded />
              </IconButton>
              <Link
                className="mobile-brand"
                to="/"
                aria-label="Vikrantious home"
              >
                <img src="/vk-logo.svg" alt="VK" width="29" height="29" />
              </Link>
              <span className="breadcrumb-root">Vikrantious</span>{" "}
              <span>/</span>{" "}
              <strong>{names[pathname] || "Page not found"}</strong>
            </div>
            <div className="topbar-right">
              <span className="personal-label">
                <i /> A little space for big ideas
              </span>
              <Tooltip
                title={`Theme: ${preference === "god-of-war" ? "God of War" : preference}`}
              >
                <IconButton
                  aria-label="Choose theme"
                  aria-haspopup="menu"
                  aria-expanded={Boolean(themeAnchor)}
                  onClick={(e) => setThemeAnchor(e.currentTarget)}
                  size="small"
                >
                  {preference === "system" ? (
                    <ContrastRounded fontSize="small" />
                  ) : dark ? (
                    <DarkModeOutlined fontSize="small" />
                  ) : (
                    <LightModeOutlined fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
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
            anchorEl={themeAnchor}
            open={Boolean(themeAnchor)}
            onClose={() => setThemeAnchor(null)}
          >
            {(
              ["system", "light", "dark", "pokemon", "god-of-war"] as const
            ).map((value) => (
              <MenuItem
                key={value}
                role="menuitemradio"
                aria-checked={preference === value}
                selected={preference === value}
                onClick={() => {
                  setPreference(value);
                  setThemeAnchor(null);
                }}
              >
                {value === "system"
                  ? "Use device theme"
                  : value === "pokemon"
                    ? "Pokémon theme"
                    : value === "god-of-war"
                      ? "God of War theme"
                      : `${value[0].toUpperCase()}${value.slice(1)} theme`}
              </MenuItem>
            ))}
          </Menu>
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
