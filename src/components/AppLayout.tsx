import { ThemeProvider, CssBaseline, createTheme, AppBar, Toolbar, Typography, Box, IconButton, Avatar } from '@mui/material';
import { useMemo, useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(() => createTheme({
    palette: { mode, background: { default: mode === 'dark' ? '#18181b' : '#f5f5f5' } },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' },
  }), [mode]);
  const username = localStorage.getItem('username');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1, background: '#18181b', borderBottom: '1px solid #23232b' }}>
        <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: '#90caf9', width: 32, height: 32, fontWeight: 700 }}>V</Avatar>
            <Typography variant="h6" noWrap component="div" fontWeight={700} color="#fff">
              Vikrantious
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            {username && (
              <Typography color="#90caf9" fontWeight={600}>{username}</Typography>
            )}
            <IconButton color="inherit" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>{mode === 'dark' ? '🌞' : '🌙'}</IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex' }}>
        {/* NavBar is rendered as a permanent Drawer */}
        <Box component="nav" sx={{ width: 72, flexShrink: 0 }} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, ml: 0, mt: 8, minHeight: '100vh', background: mode === 'dark' ? '#18181b' : '#f5f5f5' }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
