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
  obtenerAlternativas,
  crearAlternativa,
  actualizarAlternativa,
  eliminarAlternativa
} from '../../services/escuelaService';
import { useSnackbar } from '../../contexts/SnackbarContext';

const estados = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

const AlternativasList = () => {
  const [alternativas, setAlternativas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAlternativa, setSelectedAlternativa] = useState(null);
  const [formData, setFormData] = useState({
    texto_alternativa: '',
    estado: 'activo'
  });
  const { mostrarSnackbar } = useSnackbar();

  const cargarAlternativas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerAlternativas();
      setAlternativas(data);
    } catch (error) {
      mostrarSnackbar('Error al cargar alternativas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [mostrarSnackbar]);

  useEffect(() => {
    cargarAlternativas();
  }, [cargarAlternativas]);

  const handleOpenDialog = (alternativa = null) => {
    if (alternativa) {
      setFormData({
        texto_alternativa: alternativa.texto_alternativa || '',
        estado: alternativa.estado || 'activo'
      });
      setSelectedAlternativa(alternativa);
    } else {
      setFormData({ texto_alternativa: '', estado: 'activo' });
      setSelectedAlternativa(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ texto_alternativa: '', estado: 'activo' });
    setSelectedAlternativa(null);
  };

  const handleOpenDeleteDialog = (alternativa) => {
    setSelectedAlternativa(alternativa);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAlternativa(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      if (selectedAlternativa) {
        await actualizarAlternativa(selectedAlternativa.id, {
          ...formData,
          fecha_actualizacion: now
        });
        mostrarSnackbar('Alternativa actualizada exitosamente');
      } else {
        await crearAlternativa({
          ...formData,
          fecha_creacion: now,
          fecha_actualizacion: now
        });
        mostrarSnackbar('Alternativa creada exitosamente');
      }
      handleCloseDialog();
      await cargarAlternativas();
    } catch (error) {
      mostrarSnackbar('Error al guardar alternativa: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    setLoading(true);
    try {
      await eliminarAlternativa(selectedAlternativa.id);
      mostrarSnackbar('Alternativa eliminada exitosamente');
      await cargarAlternativas();
    } catch (error) {
      mostrarSnackbar('Error al eliminar alternativa: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setSelectedAlternativa(null);
    }
  };

  if (loading && alternativas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Alternativas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Alternativa
        </Button>
      </Box>
      {alternativas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay alternativas registradas
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#308be7' }}>
                <TableCell sx={{ color: '#fff' }}>Texto</TableCell>
                <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alternativas.map((alternativa, idx) => (
                <TableRow key={alternativa.id} sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd' } : { backgroundColor: '#fff' }}>
                  <TableCell>{alternativa.texto_alternativa}</TableCell>
                  <TableCell>{estados.find(e => e.value === alternativa.estado)?.label || alternativa.estado}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(alternativa)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(alternativa)}>
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
        <DialogTitle>{selectedAlternativa ? 'Editar Alternativa' : 'Nueva Alternativa'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Texto de la Alternativa"
              name="texto_alternativa"
              value={formData.texto_alternativa}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              select
              fullWidth
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              margin="normal"
              required
            >
              {estados.map((estado) => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {selectedAlternativa ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar esta alternativa?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlternativasList; 