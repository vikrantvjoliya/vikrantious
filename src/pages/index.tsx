import AppLayout from "@/components/AppLayout";
import { useGuestAuth } from '../utils/useGuestAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import '../styles/global.css';

export default function HomePage() {
  const userId = useGuestAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <AppLayout>
      <section className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome to <span className="text-blue-600">Vikrantious</span></h1>
          <p className="text-lg text-gray-600 mb-4">A modern, minimal note-taking and productivity suite.</p>
          <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 text-gray-700 text-sm font-mono mb-2">Guest ID: <span className="text-blue-600">{userId}</span></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition group border border-gray-100">
            <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition">Text Notes</h2>
            <p className="text-gray-600 mb-4">Quickly jot down and organize your thoughts with markdown support.</p>
            <Button onClick={() => navigate('/text-notes')} className="mt-auto">Go to Text Notes</Button>
          </div>
          <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition group border border-gray-100">
            <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition">Drawing Notes</h2>
            <p className="text-gray-600 mb-4">Sketch ideas and diagrams with a simple, intuitive canvas.</p>
            <Button onClick={() => navigate('/drawing-notes')} className="mt-auto">Go to Drawing Notes</Button>
          </div>
          <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition group border border-gray-100">
            <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition">File Notes</h2>
            <p className="text-gray-600 mb-4">Upload and manage files, PDFs, and more for your projects.</p>
            <Button onClick={() => navigate('/file-notes')} className="mt-auto">Go to File Notes</Button>
          </div>
          <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition group border border-gray-100">
            <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition">Suika Game</h2>
            <p className="text-gray-600 mb-4">Take a break and play the Suika Game for fun and relaxation.</p>
            <Button onClick={() => navigate('/suika-game')} className="mt-auto">Play Suika Game</Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
