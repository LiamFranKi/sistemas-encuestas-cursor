import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDocentesByGrado, getGrados, getPreguntasByEncuesta, getAlternativasByPregunta } from '../services/firestore';
import { db } from '../config/firebase';
import { doc, getDoc as getDocFirestore } from 'firebase/firestore';

const logoUrl = '/assets/vanguard-logo.png';

const DocentesPorGradoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grado, setGrado] = useState(null);
  const [encuesta, setEncuesta] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [alternativas, setAlternativas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [showWarning, setShowWarning] = useState(false);

  // Recibe los ids desde location.state
  const encuestaId = location.state?.encuestaId;
  const gradoId = location.state?.gradoId;

  // Variable auxiliar para el texto del botón siguiente/finalizar
  const botonSiguienteTexto = (preguntaActual === preguntas.length - 1) ? 'Finalizar encuesta' : 'Siguiente';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del grado
        const gradosList = await getGrados();
        const gradoSel = gradosList.find(g => g.id === gradoId);
        if (!gradoSel) throw new Error('No se encontró el grado seleccionado.');
        setGrado(gradoSel);
        // Obtener datos de la encuesta seleccionada
        const encuestaDoc = await getDocFirestore(doc(db, 'encuestas', encuestaId));
        if (!encuestaDoc.exists()) throw new Error('No se encontró la encuesta seleccionada.');
        setEncuesta({ id: encuestaDoc.id, ...encuestaDoc.data() });
        // Obtener preguntas de la encuesta
        const preguntasList = await getPreguntasByEncuesta(encuestaId);
        setPreguntas(preguntasList);
        // Obtener docentes del grado y ordenarlos por nombre
        let docentesList = await getDocentesByGrado(gradoId);
        docentesList = docentesList.sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  // Cargar alternativas cuando cambia la pregunta actual
  useEffect(() => {
    const cargarAlternativas = async () => {
      if (preguntas.length > 0 && preguntas[preguntaActual]) {
        try {
          const alternativasList = await getAlternativasByPregunta(preguntas[preguntaActual].id);
          setAlternativas(alternativasList);
        } catch (err) {
          setAlternativas([]);
        }
      } else {
        setAlternativas([]);
      }
    };
    cargarAlternativas();
  }, [preguntaActual, preguntas]);

  // Ordenar alternativas por id antes de renderizar
  const alternativasOrdenadas = [...alternativas].sort((a, b) => a.id.localeCompare(b.id));

  // Limpiar respuestas al cambiar de pregunta
  useEffect(() => {
    setRespuestas({});
    setShowWarning(false);
  }, [preguntaActual]);

  const handleAnterior = () => {
    setPreguntaActual((prev) => Math.max(prev - 1, 0));
  };

  // Validar si todos los docentes tienen respuesta para la pregunta actual
  const todosRespondidos = docentes.length > 0 && docentes.every(docente => respuestas[docente.id]);

  const handleSiguiente = () => {
    if (!todosRespondidos) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    setPreguntaActual((prev) => Math.min(prev + 1, preguntas.length - 1));
  };

  const handleFinalizar = () => {
    if (!todosRespondidos) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    // Aquí puedes navegar a una página de agradecimiento o resumen
    navigate('/');
  };

  // Manejar selección de alternativa para cada docente
  const handleSeleccionAlternativa = (docenteId, alternativaId) => {
    setRespuestas(prev => ({
      ...prev,
      [docenteId]: alternativaId
    }));
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
          {/* Navegación de preguntas (arriba) */}
          {preguntas.length > 0 && (
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleAnterior}
                disabled={preguntaActual === 0}
              >
                Anterior
              </Button>
              <Button
                variant={preguntaActual === preguntas.length - 1 ? 'contained' : 'contained'}
                color={preguntaActual === preguntas.length - 1 ? 'success' : 'primary'}
                onClick={preguntaActual === preguntas.length - 1 ? handleFinalizar : handleSiguiente}
                disabled={!todosRespondidos}
              >
                {botonSiguienteTexto}
              </Button>
            </Stack>
          )}
          {showWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Debes responder para todos los docentes antes de continuar.
            </Alert>
          )}
          {/* Mostrar la pregunta actual como subtítulo grande */}
          {preguntas.length > 0 && (
            <>
              <Typography variant="h5" color="primary" fontWeight={600} sx={{ mb: 2 }}>
                {preguntas[preguntaActual]?.texto_pregunta || ''}
              </Typography>
              {/* Ya no se muestra el texto de alternativas aquí */}
            </>
          )}
          {/* Tabla de docentes y alternativas */}
          {docentes.length > 0 && alternativasOrdenadas.length > 0 && (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Docente</TableCell>
                    {alternativasOrdenadas.map((alt, idx) => (
                      <TableCell
                        key={alt.id}
                        align="center"
                        sx={{
                          background: idx % 2 === 0 ? '#e3f2fd' : '#bbdefb',
                          color: '#1976d2',
                          fontWeight: 600,
                          fontSize: '1.05rem',
                        }}
                      >
                        {alt.texto_alternativa}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {docentes.map((docente) => (
                    <TableRow key={docente.id}>
                      <TableCell sx={{ background: '#f5f6fa', fontWeight: 600 }}>
                        <Typography variant="subtitle1">{docente.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">{docente.especialidad}</Typography>
                      </TableCell>
                      {alternativasOrdenadas.map((alt) => (
                        <TableCell key={alt.id} align="center">
                          <Radio
                            checked={respuestas[docente.id] === alt.id}
                            onChange={() => handleSeleccionAlternativa(docente.id, alt.id)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Lista de docentes (solo si no hay alternativas) */}
          {alternativas.length === 0 && (
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
          )}
          {/* Navegación de preguntas (abajo) */}
          {preguntas.length > 0 && (
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleAnterior}
                disabled={preguntaActual === 0}
              >
                Anterior
              </Button>
              <Button
                variant={preguntaActual === preguntas.length - 1 ? 'contained' : 'contained'}
                color={preguntaActual === preguntas.length - 1 ? 'success' : 'primary'}
                onClick={preguntaActual === preguntas.length - 1 ? handleFinalizar : handleSiguiente}
                disabled={!todosRespondidos}
              >
                {botonSiguienteTexto}
              </Button>
            </Stack>
          )}
          {showWarning && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Debes responder para todos los docentes antes de continuar.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DocentesPorGradoPage; 