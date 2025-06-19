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
  const [yaRespondio, setYaRespondio] = useState(false);

  useEffect(() => {
    // Verificar si ya respondió la encuesta
    const encuestaRespondida = localStorage.getItem('encuesta-respondida');
    if (encuestaRespondida === 'true') {
      setYaRespondio(true);
    }
  }, []);

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
          {yaRespondio ? (
            <Alert severity="info" sx={{ mt: 4, fontSize: '1.2rem' }}>
              Ya has respondido esta encuesta. ¡Gracias por tu participación!
            </Alert>
          ) : (
            <>
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
                <Grid container spacing={3} sx={{ maxWidth: 800 }}>
                  {grados.map((grado) => (
                    <Grid key={grado.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 8,
                          },
                        }}
                        onClick={() => handleComenzar(grado.id)}
                      >
                        <CardContent>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {grado.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {grado.descripcion}
                          </Typography>
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            Nivel: {grado.nivel}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            variant="contained"
                            fullWidth
                            onClick={() => handleComenzar(grado.id)}
                          >
                            Comenzar
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage; 