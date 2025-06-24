import { useRef, useState, useEffect } from 'react';
import { Box, Button, Stack, Typography, Card, CardContent, Fab, Tooltip, Fade } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';

export default function DrawingNotesPage() {
  const userId = useGuestAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  const handleMouseDown = () => setDrawing(true);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#90caf9';
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };
  const handleMouseUp = () => {
    setDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };
  const handleClear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };
  const handleSave = async () => {
    if (!canvasRef.current || !userId) return;
    setLoading(true);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `drawing-${userId}.png`;
    await supabase.storage.from('notes-files').upload(fileName, blob, { upsert: true, contentType: 'image/png' });
    const { data } = supabase.storage.from('notes-files').getPublicUrl(fileName);
    setImgUrl(data.publicUrl);
    setLoading(false);
  };
  const handleLoad = async () => {
    if (!userId) return;
    const fileName = `drawing-${userId}.png`;
    const { data } = supabase.storage.from('notes-files').getPublicUrl(fileName);
    if (data.publicUrl) setImgUrl(data.publicUrl);
  };
  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Fade in={show} timeout={600}>
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} mb={2}>
              <Button onClick={handleClear} variant="outlined">Clear</Button>
              <Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button onClick={handleLoad} variant="contained">Load</Button>
            </Stack>
            <Box display="flex" justifyContent="center">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                style={{ border: '1px solid #23232b', borderRadius: 8, background: '#18181b' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </Box>
          </CardContent>
        </Card>
      </Fade>
      {imgUrl && (
        <Fade in={show} timeout={1000}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" mb={1}>Saved Drawing:</Typography>
              <Box display="flex" justifyContent="center">
                <img src={imgUrl} alt="Saved Drawing" style={{ maxWidth: 500, border: '1px solid #eee', borderRadius: 8 }} />
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}
      <Fade in={show} timeout={1200}>
        <Tooltip title="Clear Canvas">
          <Fab color="secondary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={handleClear}>
            <ClearIcon />
          </Fab>
        </Tooltip>
      </Fade>
    </Box>
  );
}
