import { useGuestAuth } from '../utils/useGuestAuth';
import { Box, Typography, Card, CardContent, Fab, Tooltip, Fade } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const userId = useGuestAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 96px)">
      <Fade in={show} timeout={600}>
        <Card sx={{ minWidth: 350, maxWidth: 500, p: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" mb={2} fontWeight={700} color="primary">Welcome to Vikrantious</Typography>
            <Typography color="text.secondary">Your guest user ID:</Typography>
            <Typography fontSize={14} mb={2} sx={{ wordBreak: 'break-all' }}>{userId}</Typography>
            <Typography mt={2}>Choose a note type from the menu to get started.</Typography>
          </CardContent>
        </Card>
      </Fade>
      <Fade in={show} timeout={1000}>
        <Tooltip title="Add Text Note">
          <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => navigate('/text-notes')}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Fade>
    </Box>
  );
}
