import { useState, useEffect } from 'react';
import { Box, Button, TextField, Stack, Typography, Card, CardContent, Paper, Fab, Tooltip, Fade } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';

export default function TextNotesPage() {
  const userId = useGuestAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<{ id: number; content: string }[]>([]);
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  const fetchNotes = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('text_notes')
      .select('id, content')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    setNotes(data || []);
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, [userId]);

  const saveNote = async () => {
    setLoading(true);
    await supabase.from('text_notes').insert({ user_id: userId, content: note });
    setLoading(false);
    setNote('');
    fetchNotes();
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Fade in={show} timeout={600}>
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Write your note here..."
                value={note}
                onChange={e => setNote(e.target.value)}
                multiline
                minRows={6}
              />
              <Button variant="contained" onClick={saveNote} disabled={!note || loading}>
                {loading ? 'Saving...' : 'Save Note'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
      <Typography variant="h6" mb={1}>Your Notes</Typography>
      <Fade in={show} timeout={1000}>
        <Box>
          {notes.length === 0 && <Typography color="text.secondary">No notes yet.</Typography>}
          {notes.map(n => (
            <Paper key={n.id} sx={{ p: 2, mb: 2, background: '#23232b', color: '#fff', borderRadius: 2 }}>
              <Typography>{n.content}</Typography>
            </Paper>
          ))}
        </Box>
      </Fade>
      <Fade in={show} timeout={1200}>
        <Tooltip title="Add New Note">
          <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Fade>
    </Box>
  );
}
