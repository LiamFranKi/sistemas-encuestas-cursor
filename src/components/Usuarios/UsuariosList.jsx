import React from 'react';
import { Box, Typography } from '@mui/material';

const UsuariosList = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Usuarios</Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí irá el CRUD de usuarios.
      </Typography>
    </Box>
  );
};

export default UsuariosList; 