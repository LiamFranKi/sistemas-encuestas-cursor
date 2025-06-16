import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { getDocentesByGrado, getGrados, getEncuestaActiva } from '../services/firestore';

const logoUrl = '/assets/vanguard-logo.png';

const DocentesPorGradoPage = () => {
  const location = useLocation();
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grado, setGrado] = useState(null);
  const [encuesta, setEncuesta] = useState(null);

  // Recibe los ids desde location.state
  const encuestaId = location.state?.encuestaId;
  const gradoId = location.state?.gradoId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del grado
        const gradosList = await getGrados();
        const gradoSel = gradosList.find(g => g.id === gradoId);
        if (!gradoSel) throw new Error('No se encontró el grado seleccionado.');
        setGrado(gradoSel);
        // Obtener datos de la encuesta activa (o podrías buscar por id si tienes función)
        const encuestaActiva = await getEncuestaActiva();
        if (!encuestaActiva) throw new Error('No se encontró la encuesta activa.');
        setEncuesta(encuestaActiva);
        // Obtener docentes del grado
        const docentesList = await getDocentesByGrado(gradoId);
        setDocentes(docentesList);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    if (encuestaId && gradoId) {
      fetchData();
    } else {
      setError('Faltan datos para mostrar la página.');
      setLoading(false);
    }
  }, [encuestaId, gradoId]);

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
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="warning" sx={{ mt: 4 }}>{error}</Alert>
      ) : (
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ mr: 2 }}>
              {encuesta?.titulo}
            </Typography>
            {grado && (
              <Typography variant="h6" color="secondary">
                {grado.nombre} - {grado.nivel}
              </Typography>
            )}
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Docentes del grado:
          </Typography>
          <List>
            {docentes.map((docente) => (
              <ListItem key={docente.id} divider>
                <ListItemText
                  primary={docente.nombre}
                  secondary={docente.especialidad}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default DocentesPorGradoPage; 