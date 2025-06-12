import React from 'react';
import { Box, Typography } from '@mui/material';

const Estadisticas = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Estadísticas</Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí se mostrarán las estadísticas del sistema.
      </Typography>
    </Box>
  );
};

export default Estadisticas; 