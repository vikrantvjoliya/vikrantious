import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import NotesPage from './pages/NotesPage.tsx';
import DrawingPage from './pages/DrawingPage.tsx';
import PDFReaderPage from './pages/PDFReaderPage';
import LoginPage from './pages/LoginPage';
import { useGuestAuth } from './hooks/useGuestAuth.tsx';

function RequireAuth({ children }: { children: ReactNode }) {
  const userId = useGuestAuth();
  const location = useLocation();
  
  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/drawing" element={<DrawingPage />} />
                  <Route path="/pdf" element={<PDFReaderPage />} />
                </Routes>
              </Layout>
            </RequireAuth>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}