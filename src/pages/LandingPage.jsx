import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, IconButton, Tooltip, CircularProgress, Alert, Grid, Card, CardContent, CardActions } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { getEncuestaActiva, getGrados } from '../services/firestore';

const logoUrl = '/assets/vanguard-logo.png'; // Asegúrate de colocar el logo en public/assets con este nombre

const LandingPage = () => {
  const navigate = useNavigate();
  const [encuesta, setEncuesta] = useState(null);
  const [loadingEncuesta, setLoadingEncuesta] = useState(true);
  const [errorEncuesta, setErrorEncuesta] = useState(null);
  const [grados, setGrados] = useState([]);
  const [loadingGrados, setLoadingGrados] = useState(true);
  const [errorGrados, setErrorGrados] = useState(null);

  useEffect(() => {
    const fetchEncuesta = async () => {
      try {
        const encuestaActiva = await getEncuestaActiva();
        setEncuesta(encuestaActiva);
      } catch (err) {
        setErrorEncuesta(err.message);
      } finally {
        setLoadingEncuesta(false);
      }
    };
    fetchEncuesta();
  }, []);

  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const gradosList = await getGrados();
        // Ordenar primero por nivel, luego por nombre
        gradosList.sort((a, b) => {
          if (a.nivel < b.nivel) return -1;
          if (a.nivel > b.nivel) return 1;
          if (a.nombre < b.nombre) return -1;
          if (a.nombre > b.nombre) return 1;
          return 0;
        });
        setGrados(gradosList);
      } catch (err) {
        setErrorGrados('Error al cargar los grados.');
      } finally {
        setLoadingGrados(false);
      }
    };
    fetchGrados();
  }, []);

  const handleComenzar = (gradoId) => {
    if (encuesta) {
      navigate('/docentes-por-grado', { state: { encuestaId: encuesta.id, gradoId } });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f6fa',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 32, right: 32, zIndex: 10 }}>
        <Tooltip title="Iniciar sesión como administrador">
          <IconButton
            href="/login"
            sx={{
              background: '#f5f6fa',
              color: '#222',
              boxShadow: 2,
              '&:hover': {
                background: '#e1e3ea',
                color: '#111',
              },
              transition: '0.2s',
            }}
            size="large"
          >
            <LockOutlinedIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      <Paper elevation={6} sx={{ p: 6, borderRadius: 4, textAlign: 'center', background: 'transparent', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img src={logoUrl} alt="Vanguard Schools Logo" style={{ width: 220, marginBottom: 24 }} />
          <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
            Encuestas Vanguard Schools
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            ¡Bienvenido! Aquí podrás participar en las encuestas de tu colegio de manera fácil y segura.
          </Typography>
          {/* Encuesta activa */}
          {loadingEncuesta ? (
            <Box sx={{ mt: 2 }}><CircularProgress /></Box>
          ) : errorEncuesta ? (
            <Alert severity="warning" sx={{ mt: 2 }}>{errorEncuesta}</Alert>
          ) : encuesta ? (
            <Box sx={{ mb: 4, width: '100%' }}>
              <Typography variant="h4" fontWeight={700} color="secondary" sx={{ mb: 1 }}>
                {encuesta.titulo}
              </Typography>
              {encuesta.descripcion && (
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {encuesta.descripcion}
                </Typography>
              )}
            </Box>
          ) : null}
          {/* Grados */}
          {loadingGrados ? (
            <Box sx={{ mt: 4 }}><CircularProgress /></Box>
          ) : errorGrados ? (
            <Alert severity="warning" sx={{ mt: 4 }}>{errorGrados}</Alert>
          ) : (
            <Grid container columns={12} spacing={3} justifyContent="center">
              {grados.map((grado) => (
                <Grid key={grado.id} sx={{ gridColumn: 'span 4' }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, background: '#e3f2fd' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        {grado.nombre}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Nivel: {grado.nivel}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleComenzar(grado.id)}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 4,
                          py: 1,
                          boxShadow: 2,
                          background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
                          color: '#fff',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #2a5298 0%, #1e3c72 100%)',
                          },
                        }}
                      >
                        Comenzar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage; 