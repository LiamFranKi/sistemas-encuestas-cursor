import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useEncuestaActiva } from '../../contexts/EncuestaActivaContext';

// Paleta de colores pastel para las cards
const pastelColors = [
  '#FFDEE9', // rosa claro
  '#B5FFFC', // celeste
  '#C9FFBF', // verde
  '#FFFACD', // amarillo
  '#FFD6E0', // rosado
  '#E0BBE4', // lila
  '#FEE4CB', // durazno
  '#D0F4DE', // verde agua
  '#F3EAC2', // crema
];

const PublicLanding = () => {
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yaRespondio, setYaRespondio] = useState(false);
  const navigate = useNavigate();
  const { encuesta, loading: loadingEncuesta } = useEncuestaActiva();

  useEffect(() => {
    // Verificar si ya respondió la encuesta
    const encuestaRespondida = localStorage.getItem('encuesta-respondida');
    if (encuestaRespondida === 'true') {
      setYaRespondio(true);
    }
  }, []);

  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const gradosRef = collection(db, 'grados');
        const snapshot = await getDocs(gradosRef);
        let gradosList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordenar por nivel y luego por nombre
        gradosList = gradosList.sort((a, b) => {
          if (a.nivel < b.nivel) return -1;
          if (a.nivel > b.nivel) return 1;
          if (a.nombre < b.nombre) return -1;
          if (a.nombre > b.nombre) return 1;
          return 0;
        });
        setGrados(gradosList);
      } catch (error) {
        console.error('Error al cargar los grados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrados();
  }, []);

  const handleGradoSelect = (gradoId) => {
    if (encuesta && encuesta.id) {
      navigate(`/encuesta/${encuesta.id}/${gradoId}`);
    } else {
      alert('No hay encuesta activa disponible.');
    }
  };

  if (loading || loadingEncuesta) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography>Cargando grados disponibles...</Typography>
        </Box>
      </Container>
    );
  }

  if (yaRespondio) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ fontSize: '1.2rem', textAlign: 'center' }}>
          Ya has respondido esta encuesta. ¡Gracias por tu participación!
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {encuesta?.titulo || 'Encuesta de Desempeño Docente'}
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
        Por favor, selecciona tu grado para comenzar la encuesta
      </Typography>

      <Grid container spacing={4}>
        {grados.map((grado, idx) => (
          <Grid key={grado.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                background: pastelColors[idx % pastelColors.length],
                '&:hover': {
                  transform: 'scale(1.04)',
                  boxShadow: 8,
                  background: pastelColors[(idx + 1) % pastelColors.length],
                },
              }}
              onClick={() => handleGradoSelect(grado.id)}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip label={grado.nivel} color="primary" size="small" />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                    {grado.nombre}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                  {grado.descripcion}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 3, fontWeight: 600, letterSpacing: 1 }}
                  onClick={() => handleGradoSelect(grado.id)}
                >
                  Seleccionar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PublicLanding; 