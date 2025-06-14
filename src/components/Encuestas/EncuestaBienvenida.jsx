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

const EncuestaBienvenida = () => {
  const navigate = useNavigate();
  const { encuestaId, gradoId } = useParams();
  const { encuesta, loading: loadingEncuesta } = useEncuestaActiva();

  const handleEmpezar = () => {
    navigate(`/encuesta/${encuestaId}/${gradoId}/preguntas`);
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
            Esta encuesta tiene como objetivo evaluar el desempeño de tus docentes para mejorar la calidad educativa.
          </Typography>

          <Typography variant="body1" paragraph>
            Por favor, responde con sinceridad y objetividad a cada pregunta.
          </Typography>

          <Typography variant="body1" paragraph>
            Recuerda que tus respuestas son anónimas y ayudarán a mejorar la experiencia educativa.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleEmpezar}
              sx={{ minWidth: 200 }}
            >
              Empezar Encuesta
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EncuestaBienvenida; 