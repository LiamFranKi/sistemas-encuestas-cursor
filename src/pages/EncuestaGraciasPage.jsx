import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';

const logoUrl = '/assets/vanguard-logo.png';

const EncuestaGraciasPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Marcar que el usuario ya completó la encuesta
    localStorage.setItem('encuesta-respondida', 'true');
  }, []);

  const handleCerrar = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: '#f5f6fa',
        py: 6,
      }}
    >
      <img src={logoUrl} alt="Vanguard Schools Logo" style={{ width: 180, marginBottom: 24 }} />
      
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            ¡Gracias por tu participación!
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            Tu opinión es muy importante para nosotros y nos ayudará a mejorar la calidad educativa.
          </Typography>

          <Typography variant="body1" paragraph>
            Las respuestas serán analizadas de manera confidencial y anónima.
          </Typography>

          <Typography variant="body1" paragraph>
            Agradecemos tu tiempo y colaboración en este proceso de mejora continua.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCerrar}
              sx={{
                minWidth: 200,
                background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.1rem',
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
            >
              Cerrar
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EncuestaGraciasPage; 