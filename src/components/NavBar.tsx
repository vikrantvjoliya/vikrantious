import { Drawer, List, ListItem, ListItemButton, ListItemIcon, Box, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NotesIcon from '@mui/icons-material/Notes';
import BrushIcon from '@mui/icons-material/Brush';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useNavigate } from 'react-router-dom';
import SuikaGameIcon from './SuikaGameIcon';

const navLinks = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { to: '/text-notes', label: 'Text Notes', icon: <NotesIcon /> },
  { to: '/drawing-notes', label: 'Drawing Notes', icon: <BrushIcon /> },
  { to: '/file-notes', label: 'File Notes', icon: <InsertDriveFileIcon /> },
  { to: '/suika-game', label: 'Suika Game', icon: <SuikaGameIcon /> },
];

export default function NavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 72,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 72,
          boxSizing: 'border-box',
          background: '#18181b',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRight: '1px solid #23232b',
        },
      }}
    >
      <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={4}>
        <List>
          {navLinks.map(link => (
            <Tooltip title={link.label} placement="right" key={link.to} arrow>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  sx={{
                    minHeight: 56,
                    justifyContent: 'center',
                    borderRadius: 2,
                    '&.active': {
                      background: '#23232b',
                      color: '#90caf9',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center' }}>{link.icon}</ListItemIcon>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
      <Box mb={2}>
        <Tooltip title="Logout" placement="right" arrow>
          <ListItemButton onClick={handleLogout} sx={{ minHeight: 56, justifyContent: 'center', borderRadius: 2 }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center' }}>
              <LogoutIcon />
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
