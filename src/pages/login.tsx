import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Alert, Fade } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .eq('password', password)
      .single();
    setLoading(false);
    if (error || !data) {
      setError('Invalid username or password');
      return;
    }
    localStorage.setItem('user_id', data.id);
    localStorage.setItem('username', data.username);
    window.location.href = '/';
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 96px)">
      <Fade in={show} timeout={600}>
        <Card sx={{ minWidth: 350, maxWidth: 400, p: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" mb={2} fontWeight={700} color="primary">Login</Typography>
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleLogin}
              disabled={loading || !username || !password}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
