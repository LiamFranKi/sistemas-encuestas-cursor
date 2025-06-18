import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import {
  obtenerEstadisticasGenerales,
  obtenerEstadisticasPorEncuesta,
  obtenerEstadisticasPorGrado,
  obtenerDocentesPorEncuesta,
  obtenerDocentesPorGrado
} from '../../services/estadisticasService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart as ReBarChart, Bar as ReBar, XAxis as ReXAxis, YAxis as ReYAxis, Tooltip as ReTooltip, ResponsiveContainer as ReResponsiveContainer, Legend as ReLegend, Cell as ReCell } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const COLORS = ['#308be7', '#43a047', '#fbc02d', '#8e24aa'];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const EstadisticasList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [estadisticas, setEstadisticas] = useState({
    generales: null,
    porEncuesta: [],
    porGrado: [],
    porPregunta: []
  });
  const { mostrarSnackbar } = useSnackbar();
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
  const [kpisEncuesta, setKpisEncuesta] = useState(null);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
  const [kpisGrado, setKpisGrado] = useState(null);
  const [preguntasPorGrado, setPreguntasPorGrado] = useState([]);
  const [alternativasPorPregunta, setAlternativasPorPregunta] = useState({});
  const [respuestasPorAlternativa, setRespuestasPorAlternativa] = useState({});

  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      const [generales, porEncuesta, porGrado] = await Promise.all([
        obtenerEstadisticasGenerales(),
        obtenerEstadisticasPorEncuesta(),
        obtenerEstadisticasPorGrado()
      ]);
      setEstadisticas({
        generales,
        porEncuesta,
        porGrado,
        porPregunta: []
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas');
      mostrarSnackbar('Error al cargar las estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  }, [mostrarSnackbar]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Calcular KPIs para la encuesta seleccionada
  useEffect(() => {
    if (!encuestaSeleccionada) {
      setKpisEncuesta(null);
      return;
    }
    const fetchKPIs = async () => {
      const totalDocentes = await obtenerDocentesPorEncuesta(encuestaSeleccionada.id);
      setKpisEncuesta({
        totalGrados: estadisticas.generales?.totalGrados || 0,
        totalDocentes,
        totalPreguntas: estadisticas.generales?.totalPreguntas || 0,
        totalRespuestas: encuestaSeleccionada.totalRespuestas || 0
      });
    };
    fetchKPIs();
  }, [encuestaSeleccionada, estadisticas.generales]);

  // Calcular KPIs para el grado seleccionado
  useEffect(() => {
    if (!gradoSeleccionado) {
      setKpisGrado(null);
      return;
    }
    const fetchKPIs = async () => {
      const totalDocentes = await obtenerDocentesPorGrado(gradoSeleccionado.id);
      setKpisGrado({
        totalDocentes,
        totalPreguntas: estadisticas.generales?.totalPreguntas || 0,
        totalRespuestas: gradoSeleccionado.totalRespuestas || 0
      });
    };
    fetchKPIs();
  }, [gradoSeleccionado, estadisticas.generales]);

  // Obtener preguntas, alternativas y respuestas por alternativa para el grado seleccionado
  useEffect(() => {
    const fetchEstadisticaPorPregunta = async () => {
      if (!gradoSeleccionado) {
        setPreguntasPorGrado([]);
        setAlternativasPorPregunta({});
        setRespuestasPorAlternativa({});
        return;
      }
      // Encuesta activa
      const encuestasQuery = query(collection(db, 'encuestas'), where('estado', '==', 'activa'));
      const encuestasSnapshot = await getDocs(encuestasQuery);
      if (encuestasSnapshot.empty) return;
      const encuestaId = encuestasSnapshot.docs[0].id;
      // Preguntas de la encuesta
      const preguntasQuery = query(collection(db, 'encuesta_pregunta'), where('encuesta_id', '==', encuestaId));
      const preguntasSnapshot = await getDocs(preguntasQuery);
      const preguntasIds = preguntasSnapshot.docs.map(doc => doc.data().pregunta_id);
      // Obtener textos de las preguntas
      const preguntasTextos = [];
      for (const preguntaId of preguntasIds) {
        const preguntaDoc = await getDocs(query(collection(db, 'preguntas'), where('__name__', '==', preguntaId)));
        if (!preguntaDoc.empty) {
          preguntasTextos.push({ id: preguntaId, texto: preguntaDoc.docs[0].data().texto_pregunta });
        }
      }
      setPreguntasPorGrado(preguntasTextos);
      // Alternativas por pregunta
      const alternativasPorPreguntaTemp = {};
      for (const preguntaId of preguntasIds) {
        const alternativasSnapshot = await getDocs(query(collection(db, 'pregunta_alternativa'), where('pregunta_id', '==', preguntaId)));
        alternativasPorPreguntaTemp[preguntaId] = await Promise.all(alternativasSnapshot.docs.map(async doc => {
          const altId = doc.data().alternativa_id;
          let texto = doc.data().texto_alternativa;
          if (!texto) {
            // Buscar en la colección alternativas si no está el texto
            const altDocSnap = await getDocs(query(collection(db, 'alternativas'), where('__name__', '==', altId)));
            if (!altDocSnap.empty) {
              texto = altDocSnap.docs[0].data().texto_alternativa || altId;
            } else {
              texto = altId;
            }
          }
          return {
            id: altId,
            texto
          };
        }));
      }
      setAlternativasPorPregunta(alternativasPorPreguntaTemp);
      // Respuestas por alternativa
      const respuestasPorAlternativaTemp = {};
      for (const preguntaId of preguntasIds) {
        respuestasPorAlternativaTemp[preguntaId] = {};
        for (const alternativa of alternativasPorPreguntaTemp[preguntaId] || []) {
          const respuestasSnapshot = await getDocs(query(
            collection(db, 'respuestas'),
            where('grado_id', '==', gradoSeleccionado.id),
            where('pregunta_id', '==', preguntaId),
            where('alternativa_id', '==', alternativa.id)
          ));
          respuestasPorAlternativaTemp[preguntaId][alternativa.id] = respuestasSnapshot.size;
        }
      }
      setRespuestasPorAlternativa(respuestasPorAlternativaTemp);
    };
    fetchEstadisticaPorPregunta();
  }, [gradoSeleccionado]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Estadísticas
      </Typography>

      {/* Estadísticas Generales */}
      <Grid
        container
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        <Grid>
          <StatCard
            title="Total Encuestas"
            value={estadisticas.generales?.totalEncuestas || 0}
            icon={<AssignmentIcon sx={{ color: 'primary.main', fontSize: 30 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid>
          <StatCard
            title="Total Grados"
            value={estadisticas.generales?.totalGrados || 0}
            icon={<SchoolIcon sx={{ color: 'info.main', fontSize: 30 }} />}
            color="info.main"
          />
        </Grid>
        <Grid>
          <StatCard
            title="Total Docentes"
            value={estadisticas.generales?.totalDocentes || 0}
            icon={<PeopleIcon sx={{ color: 'warning.main', fontSize: 30 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid>
          <StatCard
            title="Total Preguntas"
            value={estadisticas.generales?.totalPreguntas || 0}
            icon={<QuestionAnswerIcon sx={{ color: 'secondary.main', fontSize: 30 }} />}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      {/* Tabs para diferentes vistas */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Por Encuesta" />
          <Tab label="Por Grado" />
        </Tabs>
      </Paper>

      {/* Contenido de las tabs */}
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#308be7' }}>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Título</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Estado</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Total Respuestas</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Total preguntas</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Total Docentes</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Participantes</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Fecha de Creación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estadisticas.porEncuesta.map((encuesta, idx) => (
                    <TableRow
                      key={encuesta.id}
                      sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd', cursor: 'pointer' } : { backgroundColor: '#fff', cursor: 'pointer' }}
                      onClick={() => setEncuestaSeleccionada(encuesta)}
                      selected={encuestaSeleccionada?.id === encuesta.id}
                    >
                      <TableCell align="center">{encuesta.titulo}</TableCell>
                      <TableCell align="center">{encuesta.estado}</TableCell>
                      <TableCell align="center">{encuesta.totalRespuestas}</TableCell>
                      <TableCell align="center">{encuesta.totalPreguntas}</TableCell>
                      <TableCell align="center">{encuesta.totalDocentes}</TableCell>
                      <TableCell align="center">{encuesta.participantes}</TableCell>
                      <TableCell align="center">{encuesta.fechaCreacion.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* KPIs y gráficos para la encuesta seleccionada */}
            {encuestaSeleccionada && kpisEncuesta && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Resumen de la encuesta: <b>{encuestaSeleccionada.titulo}</b>
                </Typography>
                <Grid
                  container
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Grid>
                    <StatCard title="Total Grados" value={kpisEncuesta.totalGrados} icon={<SchoolIcon color="info" />} color="info.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Docentes" value={encuestaSeleccionada.totalDocentes} icon={<PeopleIcon color="warning" />} color="warning.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Preguntas" value={encuestaSeleccionada.totalPreguntas} icon={<QuestionAnswerIcon color="secondary" />} color="secondary.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Respuestas" value={kpisEncuesta.totalRespuestas} icon={<AssignmentIcon color="primary" />} color="primary.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Participantes" value={encuestaSeleccionada.participantes} icon={<PeopleIcon color="success" />} color="success.main" />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12} md={6} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 2, width: '80%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto', my: 4 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>Gráfico de Barras</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={[
                          { name: 'Grados', value: kpisEncuesta.totalGrados },
                          { name: 'Docentes', value: encuestaSeleccionada.totalDocentes },
                          { name: 'Preguntas', value: encuestaSeleccionada.totalPreguntas },
                          { name: 'Respuestas', value: kpisEncuesta.totalRespuestas },
                          { name: 'Participantes', value: encuestaSeleccionada.participantes }
                        ]}>
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#308be7" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 2, width: '80%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto', my: 4 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>Gráfico Circular</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Grados', value: kpisEncuesta.totalGrados },
                              { name: 'Docentes', value: encuestaSeleccionada.totalDocentes },
                              { name: 'Preguntas', value: encuestaSeleccionada.totalPreguntas },
                              { name: 'Respuestas', value: kpisEncuesta.totalRespuestas },
                              { name: 'Participantes', value: encuestaSeleccionada.participantes }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={160}
                            fill="#308be7"
                            label
                          >
                            {[
                              { name: 'Grados', value: kpisEncuesta.totalGrados },
                              { name: 'Docentes', value: encuestaSeleccionada.totalDocentes },
                              { name: 'Preguntas', value: encuestaSeleccionada.totalPreguntas },
                              { name: 'Respuestas', value: kpisEncuesta.totalRespuestas },
                              { name: 'Participantes', value: encuestaSeleccionada.participantes }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#308be7' }}>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Grado</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Nivel</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Total Respuestas</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Total preguntas</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Total Docentes</TableCell>
                    <TableCell sx={{ color: '#fff', align: 'center' }} align="center">Participantes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estadisticas.porGrado
                    .slice()
                    .sort((a, b) => {
                      if (a.nivel < b.nivel) return -1;
                      if (a.nivel > b.nivel) return 1;
                      if (a.nombre < b.nombre) return -1;
                      if (a.nombre > b.nombre) return 1;
                      return 0;
                    })
                    .map((grado, idx) => (
                      <TableRow
                        key={grado.id}
                        sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd', cursor: 'pointer' } : { backgroundColor: '#fff', cursor: 'pointer' }}
                        onClick={() => setGradoSeleccionado(grado)}
                        selected={gradoSeleccionado?.id === grado.id}
                      >
                        <TableCell align="center">{grado.nombre}</TableCell>
                        <TableCell align="center">{grado.nivel}</TableCell>
                        <TableCell align="center">{grado.totalRespuestas}</TableCell>
                        <TableCell align="center">{grado.totalPreguntas}</TableCell>
                        <TableCell align="center">{grado.totalDocentes}</TableCell>
                        <TableCell align="center">{grado.participantes}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* KPIs y gráficos para el grado seleccionado */}
            {gradoSeleccionado && kpisGrado && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Resumen del grado: <b>{gradoSeleccionado.nombre}</b>
                </Typography>
                <Grid
                  container
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Grid>
                    <StatCard title="Total Docentes" value={gradoSeleccionado.totalDocentes} icon={<PeopleIcon color="warning" />} color="warning.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Preguntas" value={gradoSeleccionado.totalPreguntas} icon={<QuestionAnswerIcon color="secondary" />} color="secondary.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Respuestas" value={kpisGrado.totalRespuestas} icon={<AssignmentIcon color="primary" />} color="primary.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Participantes" value={gradoSeleccionado.participantes} icon={<PeopleIcon color="success" />} color="success.main" />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12} md={6} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 2, width: '80%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto', my: 4 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>Gráfico de Barras</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={[
                          { name: 'Docentes', value: gradoSeleccionado.totalDocentes },
                          { name: 'Preguntas', value: gradoSeleccionado.totalPreguntas },
                          { name: 'Respuestas', value: kpisGrado.totalRespuestas },
                          { name: 'Participantes', value: gradoSeleccionado.participantes }
                        ]}>
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#43a047" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 2, width: '80%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto', my: 4 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>Gráfico Circular</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Docentes', value: gradoSeleccionado.totalDocentes },
                              { name: 'Preguntas', value: gradoSeleccionado.totalPreguntas },
                              { name: 'Respuestas', value: kpisGrado.totalRespuestas },
                              { name: 'Participantes', value: gradoSeleccionado.participantes }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={160}
                            fill="#43a047"
                            label
                          >
                            {[
                              { name: 'Docentes', value: gradoSeleccionado.totalDocentes },
                              { name: 'Preguntas', value: gradoSeleccionado.totalPreguntas },
                              { name: 'Respuestas', value: kpisGrado.totalRespuestas },
                              { name: 'Participantes', value: gradoSeleccionado.participantes }
                            ].map((entry, index) => (
                              <Cell key={`cell-grado-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            {/* Estadística por pregunta y alternativa para el grado seleccionado */}
            {gradoSeleccionado && preguntasPorGrado.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Estadística por pregunta (solo para el grado seleccionado)
                </Typography>
                {preguntasPorGrado.map((pregunta, idx) => (
                  <Box key={pregunta.id} sx={{ mb: 5, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafbfc' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{`Pregunta ${idx + 1}: ${pregunta.texto}`}</Typography>
                    {/* Tabla de alternativas */}
                    <TableContainer component={Paper} sx={{ mb: 2, maxWidth: 600 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Alternativa</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cantidad de respuestas</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(alternativasPorPregunta[pregunta.id] || []).map((alt) => (
                            <TableRow key={alt.id}>
                              <TableCell align="center">{alt.texto}</TableCell>
                              <TableCell align="center">{respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* Gráfico de barras */}
                    <Box sx={{ width: '100%', maxWidth: 600, height: 300, mx: 'auto' }}>
                      <ReResponsiveContainer width="100%" height={250}>
                        <ReBarChart
                          data={(alternativasPorPregunta[pregunta.id] || []).map(alt => ({
                            name: alt.texto,
                            value: respuestasPorAlternativa[pregunta.id]?.[alt.id] || 0
                          }))}
                          layout="vertical"
                          margin={{ left: 40, right: 40 }}
                        >
                          <ReXAxis type="number" allowDecimals={false} />
                          <ReYAxis type="category" dataKey="name" width={180} />
                          <ReTooltip />
                          <ReLegend />
                          <ReBar dataKey="value" fill="#308be7">
                            {(alternativasPorPregunta[pregunta.id] || []).map((alt, i) => (
                              <ReCell key={alt.id} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </ReBar>
                        </ReBarChart>
                      </ReResponsiveContainer>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default EstadisticasList; 