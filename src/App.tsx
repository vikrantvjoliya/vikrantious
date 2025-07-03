import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren, ReactNode } from 'react';
import AppLayout from './components/AppLayout';
import NavBar from './components/NavBar';
import HomePage from './pages/index';
import TextNotesPage from './pages/text-notes';
import DrawingNotesPage from './pages/drawing-notes';
import FileNotesPage from './pages/file-notes';
import LoginPage from './pages/login';
import SuikaGamePage from './pages/suika-game';
import SessionTimeoutHandler from './components/SessionTimeoutHandler';

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
    <BrowserRouter>
      <SessionTimeoutHandler />
      <AppLayout>
        <NavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
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
          <Route
            path="/suika-game"
            element={
              // <RequireAuth>
                <SuikaGamePage />
              // </RequireAuth>
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
