import { useRef, useState, useEffect } from 'react';
import { Box, Button, Input, Typography, Stack, Alert, Card, CardContent, Fab, Tooltip, Fade } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';

export default function FileNotesPage() {
  const userId = useGuestAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]); // List of uploaded files
  const [txtContents, setTxtContents] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  // Fetch all files for this user
  const fetchFiles = async () => {
    if (!userId) return;
    const { data, error } = await supabase.storage.from('notes-files').list('', { limit: 100 });
    if (error) {
      setError(error.message);
      return;
    }
    setFiles(data || []);
    // Fetch .txt content for each .txt file
    (data || []).forEach(async (file: any) => {
      if (file.name.endsWith('.txt')) {
        const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(file.name);
        if (urlData?.publicUrl) {
          fetch(urlData.publicUrl)
            .then(res => res.text())
            .then(content => setTxtContents(prev => ({ ...prev, [file.name]: content })))
            .catch(() => setTxtContents(prev => ({ ...prev, [file.name]: 'Error loading file content.' })));
        }
      }
    });
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const { error: uploadError } = await supabase.storage.from('notes-files').upload(file.name, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setFile(null);
    fetchFiles();
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Fade in={show} timeout={600}>
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Input type="file" inputRef={inputRef} onChange={handleFileChange} />
              <Button onClick={handleUpload} disabled={!file || loading} variant="contained">
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </CardContent>
        </Card>
      </Fade>
      <Typography variant="h6" mb={1}>Your Uploaded Files</Typography>
      <Fade in={show} timeout={1000}>
        <Box>
          {files.length === 0 && <Typography color="text.secondary">No files uploaded yet.</Typography>}
          {files.map(f => {
            const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(f.name);
            const url = urlData?.publicUrl;
            if (!url) return null;
            if (f.name.endsWith('.txt')) {
              return (
                <Card key={f.name} sx={{ boxShadow: 2, mb: 2 }}>
                  <CardContent>
                    <Typography fontWeight={600}>{f.name}</Typography>
                    <Typography component="pre" fontSize={14}>{txtContents[f.name] || 'Loading...'}</Typography>
                  </CardContent>
                </Card>
              );
            }
            if (f.name.endsWith('.pdf')) {
              return (
                <Card key={f.name} sx={{ boxShadow: 2, mb: 2 }}>
                  <CardContent>
                    <Typography fontWeight={600}>{f.name}</Typography>
                    <Box mt={2} border={1} borderRadius={2} overflow="hidden">
                      <iframe src={url} width="100%" height={500} title={f.name} style={{ border: 0, width: '100%' }} />
                    </Box>
                  </CardContent>
                </Card>
              );
            }
            // Show a link for other file types
            return (
              <Card key={f.name} sx={{ boxShadow: 2, mb: 2 }}>
                <CardContent>
                  <Typography fontWeight={600}>{f.name}</Typography>
                  <Button href={url} target="_blank" rel="noopener" variant="outlined">Download</Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Fade>
      <Fade in={show} timeout={1200}>
        <Tooltip title="Upload File">
          <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => inputRef.current?.click()}>
            <UploadFileIcon />
          </Fab>
        </Tooltip>
      </Fade>
    </Box>
  );
}
