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
  obtenerEstadisticasPorGrado
} from '../../services/estadisticasService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
    // Totales generales (ya que no hay relación directa, se muestran los totales del sistema)
    setKpisEncuesta({
      totalGrados: estadisticas.generales?.totalGrados || 0,
      totalDocentes: estadisticas.generales?.totalDocentes || 0,
      totalPreguntas: estadisticas.generales?.totalPreguntas || 0,
      totalRespuestas: encuestaSeleccionada.totalRespuestas || 0
    });
  }, [encuestaSeleccionada, estadisticas.generales]);

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
            title="Encuestas Activas"
            value={estadisticas.generales?.encuestasActivas || 0}
            icon={<AssessmentIcon sx={{ color: 'success.main', fontSize: 30 }} />}
            color="success.main"
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
                    <TableCell sx={{ color: '#fff' }}>Título</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Total Respuestas</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Fecha de Creación</TableCell>
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
                      <TableCell>{encuesta.titulo}</TableCell>
                      <TableCell>{encuesta.estado}</TableCell>
                      <TableCell>{encuesta.totalRespuestas}</TableCell>
                      <TableCell>{encuesta.fechaCreacion.toLocaleDateString()}</TableCell>
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
                    <StatCard title="Total Docentes" value={kpisEncuesta.totalDocentes} icon={<PeopleIcon color="warning" />} color="warning.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Preguntas" value={kpisEncuesta.totalPreguntas} icon={<QuestionAnswerIcon color="secondary" />} color="secondary.main" />
                  </Grid>
                  <Grid>
                    <StatCard title="Total Respuestas" value={kpisEncuesta.totalRespuestas} icon={<AssignmentIcon color="primary" />} color="primary.main" />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12} md={6} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 2, width: '80%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto', my: 4 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>Gráfico de Barras</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={[
                          { name: 'Grados', value: kpisEncuesta.totalGrados },
                          { name: 'Docentes', value: kpisEncuesta.totalDocentes },
                          { name: 'Preguntas', value: kpisEncuesta.totalPreguntas },
                          { name: 'Respuestas', value: kpisEncuesta.totalRespuestas }
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
                              { name: 'Docentes', value: kpisEncuesta.totalDocentes },
                              { name: 'Preguntas', value: kpisEncuesta.totalPreguntas },
                              { name: 'Respuestas', value: kpisEncuesta.totalRespuestas }
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
                              { name: 'Docentes', value: kpisEncuesta.totalDocentes },
                              { name: 'Preguntas', value: kpisEncuesta.totalPreguntas },
                              { name: 'Respuestas', value: kpisEncuesta.totalRespuestas }
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#308be7' }}>
                  <TableCell sx={{ color: '#fff' }}>Grado</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Nivel</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Total Respuestas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estadisticas.porGrado.map((grado, idx) => (
                  <TableRow key={grado.id} sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd' } : { backgroundColor: '#fff' }}>
                    <TableCell>{grado.nombre}</TableCell>
                    <TableCell>{grado.nivel}</TableCell>
                    <TableCell>{grado.totalRespuestas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default EstadisticasList; 