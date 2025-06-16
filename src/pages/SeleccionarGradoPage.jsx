import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { getGrados } from '../services/firestore';
import { useLocation, useNavigate } from 'react-router-dom';

const logoUrl = '/assets/vanguard-logo.png';

const SeleccionarGradoPage = () => {
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Recibe el id de la encuesta desde location.state
  const encuestaId = location.state?.encuestaId;

  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const gradosList = await getGrados();
        setGrados(gradosList);
      } catch (err) {
        setError('Error al cargar los grados.');
      } finally {
        setLoading(false);
      }
    };
    fetchGrados();
  }, []);

  const handleComenzar = (gradoId) => {
    // Guardar el id de la encuesta y el grado seleccionado para la siguiente página
    // Por ahora, solo navega y pasa los datos por location.state
    navigate('/encuesta-preguntas', { state: { encuestaId, gradoId } });
  };

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
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Selecciona tu grado para comenzar la encuesta
          </Typography>
          {loading ? (
            <Box sx={{ mt: 4 }}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="warning" sx={{ mt: 4 }}>{error}</Alert>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {grados.map((grado) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={grado.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        {grado.nombre}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Sección: {grado.seccion}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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

export default SeleccionarGradoPage; 