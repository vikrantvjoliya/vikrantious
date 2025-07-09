import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 font-sans">
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <nav className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight text-blue-600">Vikrantious</a>
          <ul className="flex gap-4 text-gray-700 font-medium">
            <li><a href="/text-notes" className="hover:text-blue-600 transition">Text Notes</a></li>
            <li><a href="/drawing-notes" className="hover:text-blue-600 transition">Drawing Notes</a></li>
            <li><a href="/file-notes" className="hover:text-blue-600 transition">File Notes</a></li>
            <li><a href="/suika-game" className="hover:text-blue-600 transition">Suika Game</a></li>
          </ul>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center w-full">
        {children}
      </main>
    </div>
  );
}
