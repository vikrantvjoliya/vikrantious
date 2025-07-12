import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';
import { FileText, Save, Clock, Trash2 } from 'lucide-react';
import '../styles/global.css';

export default function TextNotesPage() {
  const userId = useGuestAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('text_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        setError(error.message);
        return;
      }
      setNotes(data || []);
    };

    fetchNotes();
  }, [userId]);

  const handleSave = async () => {
    if (!note.trim()) return;
    setLoading(true);
    setError(null);
    
    const { error: saveError } = await supabase
      .from('text_notes')
      .insert([{ user_id: userId, content: note }]);
    
    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }
    
    setNote('');
    setLoading(false);
    
    // Refresh notes
    const { data, error } = await supabase
      .from('text_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
      return;
    }
    setNotes(data || []);
  };

  const handleDelete = async (noteId: string) => {
    const { error } = await supabase
      .from('text_notes')
      .delete()
      .eq('id', noteId);
    
    if (error) {
      setError(error.message);
      return;
    }
    
    setNotes(notes.filter(n => n.id !== noteId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Text Notes</h1>
          <p className="text-gray-600">Write and organize your thoughts</p>
        </div>
      </div>

      {/* New Note Form */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-gray-50 p-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition resize-none"
              placeholder="Write your note here... (Markdown supported)"
              disabled={loading}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {note.length} characters
              </p>
              <Button 
                onClick={handleSave} 
                disabled={loading || !note.trim()} 
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Note'}</span>
              </Button>
            </div>
            {error && <Alert variant="destructive">{error}</Alert>}
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Notes</h2>
          <span className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
        </div>
        
        {notes.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notes yet. Write your first note above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notes.map(note => (
              <Card key={note.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-base font-mono bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap border">
                    {note.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
