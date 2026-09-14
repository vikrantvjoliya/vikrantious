import { Suspense, lazy, useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { CircularProgress } from "@mui/material";
import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/AuthContext";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/index";
import ResumePage from "./pages/resume";
import LoginPage from "./pages/login";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";
const TextNotesPage = lazy(() => import("./pages/text-notes"));
const DrawingNotesPage = lazy(() => import("./pages/drawing-notes"));
const FileNotesPage = lazy(() => import("./pages/file-notes"));
const SuikaGamePage = lazy(() => import("./pages/suika-game"));
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="loading">
        <CircularProgress aria-label="Loading your workspace" />
      </div>
    );
  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
}
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      "/": "Vikrant Joliya · Résumé",
      "/workspace": "Overview",
      "/login": "Sign in",
      "/text-notes": "Text notes",
      "/drawing-notes": "Drawing studio",
      "/file-notes": "Files",
      "/suika-game": "Fruity Fall",
    };
    document.title = `${titles[pathname] || "Page not found"} · Vikrantious`;
    document.getElementById("main-content")?.focus();
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteEffects />
        <SessionTimeoutHandler />
        <AppLayout>
          <Suspense
            fallback={
              <div className="loading">
                <CircularProgress aria-label="Loading page" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<ResumePage />} />
              <Route path="/resume" element={<Navigate to="/" replace />} />
              <Route path="/workspace" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/text-notes"
                element={
                  <RequireAuth>
                    <TextNotesPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/drawing-notes"
                element={
                  <RequireAuth>
                    <DrawingNotesPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/file-notes"
                element={
                  <RequireAuth>
                    <FileNotesPage />
                  </RequireAuth>
                }
              />
              <Route path="/suika-game" element={<SuikaGamePage />} />
              <Route
                path="*"
                element={
                  <div className="empty-state">
                    <h1>A little off the page.</h1>
                    <p>We couldn’t find that page.</p>
                    <Link className="primary-button" to="/">
                      Back to home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
