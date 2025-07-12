import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren, ReactNode } from 'react';
import AppLayout from './components/AppLayout';
import HomePage from './pages/index';
import TextNotesPage from './pages/text-notes';
import DrawingNotesPage from './pages/drawing-notes';
import FileNotesPage from './pages/file-notes';
import BlogPage from './pages/blog';
import LoginPage from './pages/login';
import SuikaGamePage from './pages/suika-game';
import SessionTimeoutHandler from './components/SessionTimeoutHandler';
import { ThemeProvider } from './contexts/ThemeContext';

function RequireAuth({ children }: PropsWithChildren<{ children: ReactNode }>) {
  const userId = localStorage.getItem('user_id');
  const location = useLocation();
  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SessionTimeoutHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/text-notes"
            element={
              <RequireAuth>
                <AppLayout>
                  <TextNotesPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/drawing-notes"
            element={
              <RequireAuth>
                <AppLayout>
                  <DrawingNotesPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/file-notes"
            element={
              <RequireAuth>
                <AppLayout>
                  <FileNotesPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/blog"
            element={
              <RequireAuth>
                <AppLayout>
                  <BlogPage />
                </AppLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/suika-game"
            element={
              <AppLayout>
                <SuikaGamePage />
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
