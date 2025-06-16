import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { getEncuestaActiva } from '../services/firestore';
import { useNavigate } from 'react-router-dom';

const logoUrl = '/assets/vanguard-logo.png';

const EncuestaActivaPage = () => {
  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEncuesta = async () => {
      try {
        const encuestaActiva = await getEncuestaActiva();
        setEncuesta(encuestaActiva);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEncuesta();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      }}
    >
      <Paper elevation={6} sx={{ p: 6, borderRadius: 4, textAlign: 'center', background: 'rgba(255,255,255,0.97)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img src={logoUrl} alt="Vanguard Schools Logo" style={{ width: 180, marginBottom: 18 }} />
          <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
            Encuestas Vanguard Schools
          </Typography>
          {loading ? (
            <Box sx={{ mt: 4 }}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="warning" sx={{ mt: 4 }}>{error}</Alert>
          ) : encuesta ? (
            <>
              <Typography variant="h4" fontWeight={700} color="secondary" gutterBottom sx={{ mb: 2, mt: 4 }}>
                {encuesta.titulo}
              </Typography>
              {encuesta.descripcion && (
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  {encuesta.descripcion}
                </Typography>
              )}
              <Button
                variant="contained"
                size="large"
                sx={{
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
                onClick={() => navigate('/seleccionar-grado', { state: { encuestaId: encuesta.id } })}
              >
                Empezar
              </Button>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 4 }}>No hay encuesta activa en este momento.</Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EncuestaActivaPage; 