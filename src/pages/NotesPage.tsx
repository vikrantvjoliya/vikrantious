import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Clock } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.ts';
import { useGuestAuth } from '../hooks/useGuestAuth.tsx';

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const userId = useGuestAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  // const fetchNotes = async () => {
  //   try {
  //     if (!userId) return;
  //     const { data } = await supabase
  //       // .from('text_notes')
  //       // .select('*')
  //       // .eq('user_id', userId)
  //       // .order('created_at', { ascending: false });
  //       .from('text_notes')
  //      .select('id, content, created_at, updated_at')
  //     .eq('user_id', userId)
  //     .order('id', { ascending: false });
      
  //     setNotes(data || []);
  //   } catch (error) {
  //     console.error('Error fetching notes:', error);
  //   }
  // };

  const fetchNotes = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('text_notes')
      .select('id, content, created_at, updated_at')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    setNotes(data || []);
  };

  const saveNote = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      if (editingNote) {
        await supabase
          .from('text_notes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', editingNote.id);
      } else {
        await supabase
          .from('text_notes')
          .insert([{ user_id: userId, content }]);
      }
      
      resetForm();
      await fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await supabase.from('text_notes').delete().eq('id', id);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const resetForm = () => {
    setContent('');
    setIsCreating(false);
    setEditingNote(null);
  };

  const startEditing = (note: Note) => {
    setContent(note.content);
    setEditingNote(note);
    setIsCreating(true);
  };

  const filteredNotes = notes.filter(note => 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Notes</h1>
          <p className="text-gray-600 dark:text-gray-400">Capture your thoughts and ideas</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="card p-6">
          <div className="space-y-4">
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full bg-transparent border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                disabled={loading || !content.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full">
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first note to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="btn-primary"
                >
                  Create First Note
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="card p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  <button
                    onClick={() => startEditing(note)}
                    className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {note.content.length > 150 
                  ? note.content.substring(0, 150) + '...' 
                  : note.content
                }
              </p>
              {note.updated_at !== note.created_at && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400">
                    Updated {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Add Button - Mobile */}
      <button
        onClick={() => setIsCreating(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center md:hidden transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}