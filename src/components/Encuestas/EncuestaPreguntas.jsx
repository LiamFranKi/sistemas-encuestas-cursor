import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useEncuestaActiva } from '../../contexts/EncuestaActivaContext';

const EncuestaPreguntas = () => {
  const { encuestaId, gradoId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [alternativas, setAlternativas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const { encuesta, loading: loadingEncuesta } = useEncuestaActiva();

  // Función para cargar las alternativas de una pregunta específica
  const cargarAlternativas = async (preguntaId) => {
    try {
      // Obtener las relaciones pregunta-alternativa
      const preguntaAlternativasRef = collection(db, 'pregunta_alternativa');
      const q = query(preguntaAlternativasRef, where('pregunta_id', '==', preguntaId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.warn('No se encontraron alternativas para la pregunta:', preguntaId);
        setAlternativas([]);
        return;
      }

      // Obtener los detalles de cada alternativa
      const alternativasPromises = snapshot.docs.map(async (docSnap) => {
        const alternativaId = docSnap.data().alternativa_id;
        const alternativaDoc = await getDoc(doc(db, 'alternativas', alternativaId));
        if (!alternativaDoc.exists()) {
          console.warn('No existe la alternativa con ID:', alternativaId);
          return null;
        }
        return {
          id: alternativaDoc.id,
          ...alternativaDoc.data()
        };
      });

      const alternativasList = (await Promise.all(alternativasPromises)).filter(Boolean);
      setAlternativas(alternativasList);
    } catch (error) {
      console.error('Error al cargar alternativas:', error);
      setError('Error al cargar las alternativas. Por favor, intente nuevamente.');
      setAlternativas([]);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null);
        console.log('Cargando datos para grado:', gradoId);
        
        // Cargar docentes del grado
        const gradosDocentesRef = collection(db, 'grados_docentes');
        const q = query(gradosDocentesRef, where('grado_id', '==', gradoId));
        const docentesSnapshot = await getDocs(q);
        
        if (docentesSnapshot.empty) {
          console.warn('No se encontraron docentes para el grado:', gradoId);
          setDocentes([]);
        } else {
          console.log('Docentes encontrados:', docentesSnapshot.docs.length);
          const docentesList = await Promise.all(
            docentesSnapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              console.log('Datos del documento:', data);
              const docenteId = data.docente_id;
              
              if (!docenteId) {
                console.warn('Documento sin docente_id:', docSnap.id);
                return null;
              }

              try {
                const docenteDoc = await getDoc(doc(db, 'docentes', docenteId));
                if (!docenteDoc.exists()) {
                  console.warn('No existe el docente con ID:', docenteId);
                  return null;
                }
                return {
                  id: docenteDoc.id,
                  ...docenteDoc.data()
                };
              } catch (error) {
                console.error('Error al obtener docente:', error);
                return null;
              }
            })
          );
          const docentesFiltrados = docentesList.filter(Boolean);
          console.log('Docentes cargados:', docentesFiltrados.length);
          setDocentes(docentesFiltrados);
        }

        // Cargar preguntas de la encuesta
        const preguntasRef = collection(db, 'encuesta_pregunta');
        const preguntasQuery = query(preguntasRef, where('encuesta_id', '==', encuestaId));
        const preguntasSnapshot = await getDocs(preguntasQuery);
        
        if (preguntasSnapshot.empty) {
          console.warn('No hay preguntas asociadas a esta encuesta.');
          setPreguntas([]);
        } else {
          const preguntasList = await Promise.all(
            preguntasSnapshot.docs.map(async (preguntaSnap) => {
              const preguntaId = preguntaSnap.data().pregunta_id;
              if (!preguntaId) {
                console.warn('Documento en encuesta_pregunta sin pregunta_id:', preguntaSnap.id);
                return null;
              }
              const preguntaDoc = await getDoc(doc(db, 'preguntas', preguntaId));
              if (!preguntaDoc.exists()) {
                console.warn('No existe la pregunta con ID:', preguntaId);
                return null;
              }
              return {
                id: preguntaDoc.id,
                ...preguntaDoc.data()
              };
            })
          );
          setPreguntas(preguntasList.filter(Boolean));
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [gradoId, encuestaId]);

  // Cargar alternativas cuando cambia la pregunta actual
  useEffect(() => {
    if (preguntas.length > 0 && preguntaActual < preguntas.length) {
      const preguntaActualId = preguntas[preguntaActual].id;
      cargarAlternativas(preguntaActualId);
    }
  }, [preguntaActual, preguntas]);

  const handleRespuesta = (docenteId, alternativaId) => {
    setRespuestas(prev => ({
      ...prev,
      [docenteId]: alternativaId
    }));
  };

  const handleSiguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(prev => prev + 1);
      setRespuestas({});
    } else {
      // Guardar respuestas y navegar a la página de agradecimiento
      navigate(`/encuesta/${encuestaId}/${gradoId}/gracias`);
    }
  };

  if (loading || loadingEncuesta) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!preguntas.length) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h5" color="text.secondary">
            No hay preguntas asociadas a esta encuesta.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!docentes.length) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h5" color="text.secondary">
            No hay docentes asignados a este grado.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!alternativas.length) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h5" color="text.secondary">
            No hay alternativas disponibles para esta pregunta.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {encuesta?.titulo || 'Encuesta de Desempeño Docente'}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {preguntas[preguntaActual]?.texto}
        </Typography>

        <TableContainer sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Docente</TableCell>
                {alternativas.map((alternativa) => (
                  <TableCell key={alternativa.id} align="center">
                    {alternativa.texto}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {docentes.map((docente) => (
                <TableRow key={docente.id}>
                  <TableCell>
                    <Typography variant="subtitle1">
                      {docente.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {docente.especialidad}
                    </Typography>
                  </TableCell>
                  {alternativas.map((alternativa) => (
                    <TableCell key={alternativa.id} align="center">
                      <Radio
                        checked={respuestas[docente.id] === alternativa.id}
                        onChange={() => handleRespuesta(docente.id, alternativa.id)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSiguiente}
            disabled={Object.keys(respuestas).length !== docentes.length}
          >
            {preguntaActual < preguntas.length - 1 ? 'Siguiente' : 'Finalizar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EncuestaPreguntas; 