import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  obtenerEncuestas,
  crearEncuesta,
  actualizarEncuesta,
  eliminarEncuesta
} from '../../services/encuestaService';
import { useSnackbar } from '../../contexts/SnackbarContext';

const EncuestasList = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEncuesta, setSelectedEncuesta] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'activa'
  });
  const { mostrarSnackbar } = useSnackbar();

  const cargarEncuestas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerEncuestas();
      setEncuestas(data);
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
      mostrarSnackbar('Error al cargar encuestas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [mostrarSnackbar]);

  useEffect(() => {
    cargarEncuestas();
  }, [cargarEncuestas]);

  const handleOpenDialog = (encuesta = null) => {
    if (encuesta) {
      setFormData({
        titulo: encuesta.titulo || '',
        descripcion: encuesta.descripcion || '',
        estado: encuesta.estado || 'activa'
      });
      setSelectedEncuesta(encuesta);
    } else {
      setFormData({ titulo: '', descripcion: '', estado: 'activa' });
      setSelectedEncuesta(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ titulo: '', descripcion: '', estado: 'activa' });
    setSelectedEncuesta(null);
  };

  const handleOpenDeleteDialog = (encuesta) => {
    setSelectedEncuesta(encuesta);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEncuesta(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedEncuesta) {
        await actualizarEncuesta(selectedEncuesta.id, { ...formData });
      } else {
        await crearEncuesta({ ...formData });
      }
      handleCloseDialog();
      await cargarEncuestas();
    } catch (error) {
      console.error('Error al guardar encuesta:', error);
      mostrarSnackbar('Error al guardar encuesta: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    try {
      await eliminarEncuesta(selectedEncuesta.id);
      setSelectedEncuesta(null);
      await cargarEncuestas();
    } catch (error) {
      console.error('Error al eliminar encuesta:', error);
      mostrarSnackbar('Error al eliminar encuesta: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Encuestas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null)}
        >
          Nueva Encuesta
        </Button>
      </Box>

      {encuestas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay encuestas registradas
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#308be7' }}>
                <TableCell sx={{ color: '#fff' }}>Título</TableCell>
                <TableCell sx={{ color: '#fff' }}>Descripción</TableCell>
                <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {encuestas.map((encuesta, idx) => (
                <TableRow key={encuesta.id} sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd' } : { backgroundColor: '#fff' }}>
                  <TableCell>{encuesta.titulo}</TableCell>
                  <TableCell>{encuesta.descripcion}</TableCell>
                  <TableCell>{encuesta.estado}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(encuesta)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(encuesta)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEncuesta ? 'Editar Encuesta' : 'Nueva Encuesta'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Título"
              name="titulo"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Estado"
              name="estado"
              select
              value={formData.estado}
              onChange={e => setFormData({ ...formData, estado: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="activa">Activa</MenuItem>
              <MenuItem value="inactiva">Inactiva</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {selectedEncuesta ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {openDeleteDialog && selectedEncuesta && (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro que desea eliminar la encuesta "{selectedEncuesta?.titulo}"?
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default EncuestasList; 