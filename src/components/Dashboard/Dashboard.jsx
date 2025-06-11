import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { obtenerEstadisticas } from '../../services/encuestaService';
import { obtenerGrados, obtenerDocentes } from '../../services/escuelaService';
import StatCard from './StatCard';
import { blue, green, orange, purple } from '@mui/material/colors';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEncuestas: 0,
    encuestasCompletadas: 0,
    totalDocentes: 0,
    totalGrados: 0
  });

  const cardStyles = [
    { bg: blue[50], icon: blue[700] },
    { bg: green[50], icon: green[700] },
    { bg: orange[50], icon: orange[700] },
    { bg: purple[50], icon: purple[700] },
  ];

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const [estadisticas, grados, docentes] = await Promise.all([
          obtenerEstadisticas(),
          obtenerGrados(),
          obtenerDocentes()
        ]);

        setStats({
          totalEncuestas: estadisticas.total || 0,
          encuestasCompletadas: estadisticas.completadas || 0,
          totalGrados: grados.length || 0,
          totalDocentes: docentes.length || 0
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid>
          <StatCard
            title="Total Docentes"
            value={stats.totalDocentes}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            bgColor={cardStyles[0].bg}
            iconColor={cardStyles[0].icon}
          />
        </Grid>
        <Grid>
          <StatCard
            title="Total Grados"
            value={stats.totalGrados}
            icon={<SchoolIcon sx={{ fontSize: 40 }} />}
            bgColor={cardStyles[1].bg}
            iconColor={cardStyles[1].icon}
          />
        </Grid>
        <Grid>
          <StatCard
            title="Total Encuestas"
            value={stats.totalEncuestas}
            icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
            bgColor={cardStyles[2].bg}
            iconColor={cardStyles[2].icon}
          />
        </Grid>
        <Grid>
          <StatCard
            title="Encuestas Completadas"
            value={stats.encuestasCompletadas}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            bgColor={cardStyles[3].bg}
            iconColor={cardStyles[3].icon}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 