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
  Delete as DeleteIcon,
  ListAlt as ListAltIcon
} from '@mui/icons-material';
import {
  obtenerPreguntas,
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta
} from '../../services/escuelaService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import PreguntaAlternativasDialog from './PreguntaAlternativasDialog';

const tiposPregunta = [
  { value: 'multiple', label: 'Múltiple' },
  { value: 'unica', label: 'Única' },
  { value: 'texto', label: 'Texto' }
];

const estados = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

const PreguntasList = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPregunta, setSelectedPregunta] = useState(null);
  const [openAlternativasDialog, setOpenAlternativasDialog] = useState(false);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    texto_pregunta: '',
    tipo_pregunta: 'multiple',
    estado: 'activo'
  });
  const { mostrarSnackbar } = useSnackbar();

  const cargarPreguntas = useCallback(async () => {
    setLoading(true);
    try {
      // Si quieres filtrar por encuestaId, pásalo aquí
      const data = await obtenerPreguntas();
      setPreguntas(data);
    } catch (error) {
      mostrarSnackbar('Error al cargar preguntas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [mostrarSnackbar]);

  useEffect(() => {
    cargarPreguntas();
  }, [cargarPreguntas]);

  const handleOpenDialog = (pregunta = null) => {
    if (pregunta) {
      setFormData({
        texto_pregunta: pregunta.texto_pregunta || '',
        tipo_pregunta: pregunta.tipo_pregunta || 'multiple',
        estado: pregunta.estado || 'activo'
      });
      setSelectedPregunta(pregunta);
    } else {
      setFormData({ texto_pregunta: '', tipo_pregunta: 'multiple', estado: 'activo' });
      setSelectedPregunta(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ texto_pregunta: '', tipo_pregunta: 'multiple', estado: 'activo' });
    setSelectedPregunta(null);
  };

  const handleOpenDeleteDialog = (pregunta) => {
    setSelectedPregunta(pregunta);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPregunta(null);
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
      if (selectedPregunta) {
        await actualizarPregunta(selectedPregunta.id, {
          ...formData,
          fecha_actualizacion: now
        });
        mostrarSnackbar('Pregunta actualizada exitosamente');
      } else {
        await crearPregunta({
          ...formData,
          fecha_creacion: now,
          fecha_actualizacion: now
        });
        mostrarSnackbar('Pregunta creada exitosamente');
      }
      handleCloseDialog();
      await cargarPreguntas();
    } catch (error) {
      mostrarSnackbar('Error al guardar pregunta: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    setLoading(true);
    try {
      await eliminarPregunta(selectedPregunta.id);
      mostrarSnackbar('Pregunta eliminada exitosamente');
      await cargarPreguntas();
    } catch (error) {
      mostrarSnackbar('Error al eliminar pregunta: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setSelectedPregunta(null);
    }
  };

  if (loading && preguntas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Preguntas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Pregunta
        </Button>
      </Box>
      {preguntas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay preguntas registradas
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#308be7' }}>
                <TableCell sx={{ color: '#fff' }}>Texto</TableCell>
                <TableCell sx={{ color: '#fff' }}>Tipo</TableCell>
                <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preguntas.map((pregunta, idx) => (
                <TableRow key={pregunta.id} sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd' } : { backgroundColor: '#fff' }}>
                  <TableCell>{pregunta.texto_pregunta}</TableCell>
                  <TableCell>{tiposPregunta.find(t => t.value === pregunta.tipo_pregunta)?.label || pregunta.tipo_pregunta}</TableCell>
                  <TableCell>{estados.find(e => e.value === pregunta.estado)?.label || pregunta.estado}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(pregunta)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(pregunta)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => { setPreguntaSeleccionada(pregunta); setOpenAlternativasDialog(true); }}>
                      <ListAltIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedPregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Texto de la Pregunta"
              name="texto_pregunta"
              value={formData.texto_pregunta}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              select
              fullWidth
              label="Tipo de Pregunta"
              name="tipo_pregunta"
              value={formData.tipo_pregunta}
              onChange={handleChange}
              margin="normal"
              required
            >
              {tiposPregunta.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>
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
              {selectedPregunta ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar esta pregunta?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <PreguntaAlternativasDialog
        open={openAlternativasDialog}
        onClose={() => setOpenAlternativasDialog(false)}
        pregunta={preguntaSeleccionada}
      />
    </Box>
  );
};

export default PreguntasList; 