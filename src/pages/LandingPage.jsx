import React from 'react';
import { Box, Button, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

const logoUrl = '/assets/vanguard-logo.png'; // Asegúrate de colocar el logo en public/assets con este nombre

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 32, right: 32, zIndex: 10 }}>
        <Tooltip title="Iniciar sesión como administrador">
          <IconButton
            href="/login"
            sx={{
              background: 'rgba(44,83,100,0.9)',
              color: '#fff',
              boxShadow: 2,
              '&:hover': {
                background: 'rgba(44,83,100,0.9)',
                color: '#fff',
              },
              transition: '0.2s',
            }}
            size="large"
          >
            <LockOutlinedIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      <Paper elevation={6} sx={{ p: 6, borderRadius: 4, textAlign: 'center', background: 'rgba(255,255,255,0.97)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img src={logoUrl} alt="Vanguard Schools Logo" style={{ width: 220, marginBottom: 24 }} />
          <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
            Encuestas Vanguard Schools
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            ¡Bienvenido! Aquí podrás participar en las encuestas de tu colegio de manera fácil y segura.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.2rem',
              px: 5,
              py: 1.5,
              borderRadius: 3,
              boxShadow: 3,
              transition: '0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #2a5298 0%, #1e3c72 100%)',
                transform: 'scale(1.04)',
              },
            }}
            onClick={() => navigate('/encuesta-activa')}
          >
            Ingresar a ver las encuestas
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage; 