import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { useEncuestaActiva } from '../../contexts/EncuestaActivaContext';

const EncuestaGracias = () => {
  const navigate = useNavigate();
  const { encuesta, loading: loadingEncuesta } = useEncuestaActiva();
  const { encuestaId, gradoId } = useParams();

  const handleCerrar = () => {
    navigate('/');
  };

  if (loadingEncuesta) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom>
            {encuesta?.titulo || 'Encuesta de Desempeño Docente'}
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            Tu opinión es muy importante para nosotros y nos ayudará a mejorar la calidad educativa.
          </Typography>

          <Typography variant="body1" paragraph>
            Las respuestas serán analizadas de manera confidencial y anónima.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCerrar}
              sx={{ minWidth: 200 }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EncuestaGracias; 