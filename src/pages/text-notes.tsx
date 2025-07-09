import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';
import '../styles/global.css';

export default function TextNotesPage() {
  const userId = useGuestAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    // Fetch notes for this user
    const fetchNotes = async () => {
      if (!userId) return;
      const { data, error } = await supabase.from('text_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        return;
      }
      setNotes(data || []);
    };

    fetchNotes();
    // eslint-disable-next-line
  }, [userId]);

  const handleSave = async () => {
    if (!note.trim()) return;
    setLoading(true);
    setError(null);
    const { error: saveError } = await supabase.from('text_notes').insert([{ user_id: userId, content: note }]);
    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }
    setNote('');
    setLoading(false);
    // eslint-disable-next-line
    const fetchNotes = async () => {
      if (!userId) return;
      const { data, error } = await supabase.from('text_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        return;
      }
      setNotes(data || []);
    };
    fetchNotes();
  };

  return (
    <AppLayout>
      <section className="w-full flex flex-col items-center gap-8">
        <Card className="w-full max-w-xl mx-auto shadow-lg border border-gray-100 p-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Write your note here..."
              disabled={loading}
            />
            <Button onClick={handleSave} disabled={loading || !note.trim()} className="w-full max-w-md self-center">
              {loading ? 'Saving...' : 'Save Note'}
            </Button>
            {error && <Alert variant="destructive">{error}</Alert>}
          </CardContent>
        </Card>
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          {notes.length === 0 && <p className="text-gray-500 text-center">No notes yet.</p>}
          {notes.map(n => (
            <Card key={n.id} className="shadow-md border border-gray-100">
              <CardContent>
                <pre className="text-base font-mono bg-gray-50 rounded p-2 overflow-x-auto whitespace-pre-wrap">{n.content}</pre>
                <div className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
