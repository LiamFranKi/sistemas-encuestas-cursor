import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  ExitToApp as ExitToAppIcon,
  Help as HelpIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';

const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { userRole, isAdmin, isUser } = useRole();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleNavigation = useCallback((path) => {
    setLoading(true);
    navigate(path);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simular un pequeño retraso para mostrar el loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Menú completo para administradores
  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#1976d2' }} />, path: '/dashboard' },
    { text: 'Grados', icon: <SchoolIcon sx={{ color: '#388e3c' }} />, path: '/grados' },
    { text: 'Docentes', icon: <PersonIcon sx={{ color: '#fbc02d' }} />, path: '/docentes' },
    { text: 'Encuestas', icon: <AssignmentIcon sx={{ color: '#8e24aa' }} />, path: '/encuestas' },
    { text: 'Preguntas', icon: <HelpIcon sx={{ color: '#d32f2f' }} />, path: '/preguntas' },
    { text: 'Alternativas', icon: <AssignmentIcon sx={{ color: '#1976d2' }} />, path: '/alternativas' },
    { text: 'Usuarios', icon: <GroupIcon sx={{ color: '#0288d1' }} />, path: '/usuarios' },
    { text: 'Estadísticas', icon: <BarChartIcon sx={{ color: '#43a047' }} />, path: '/estadisticas' },
  ];

  // Menú limitado para usuarios normales
  const userMenuItems = [
    { text: 'Estadísticas', icon: <BarChartIcon sx={{ color: '#43a047' }} />, path: '/estadisticas' },
  ];

  // Seleccionar menú según el rol
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  // Redirigir usuarios "user" a estadísticas si intentan acceder a otras rutas
  useEffect(() => {
    if (isUser && location.pathname !== '/estadisticas') {
      navigate('/estadisticas');
    }
  }, [isUser, location.pathname, navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sistema de Encuestas {isUser && '- Solo Estadísticas'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#e3f2fd',
            ...(open ? {} : { width: theme => theme.spacing(7) })
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  sx={location.pathname === item.path ? {
                    backgroundColor: '#308be7',
                    color: '#000',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  } : {}}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 