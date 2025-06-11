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
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { obtenerDocentes, crearDocente, actualizarDocente, eliminarDocente } from '../../services/escuelaService';

const DocentesList = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingDocente, setDeletingDocente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    especialidad: '',
    estado: 'activo'
  });
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const cargarDocentes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerDocentes();
      setDocentes(data);
    } catch (error) {
      mostrarSnackbar('Error al cargar docentes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDocentes();
  }, [cargarDocentes]);

  const handleOpenDialog = (docente = null) => {
    if (docente) {
      setFormData({
        nombre: docente.nombre || '',
        email: docente.email || '',
        especialidad: docente.especialidad || '',
        estado: docente.estado || 'activo'
      });
      setSelectedDocente(docente);
    } else {
      setFormData({ nombre: '', email: '', especialidad: '', estado: 'activo' });
      setSelectedDocente(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDocente(null);
    setFormData({
      nombre: '',
      email: '',
      especialidad: '',
      estado: 'activo'
    });
  };

  const handleOpenDeleteDialog = (docente) => {
    setDeletingDocente(docente);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingDocente(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedDocente) {
        await actualizarDocente(selectedDocente.id, { ...formData });
        mostrarSnackbar('Docente actualizado exitosamente', 'success');
      } else {
        await crearDocente({ ...formData });
        mostrarSnackbar('Docente creado exitosamente', 'success');
      }
      handleCloseDialog();
      await cargarDocentes();
    } catch (error) {
      mostrarSnackbar('Error al guardar docente: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    handleCloseDeleteDialog();
    try {
      await eliminarDocente(deletingDocente.id);
      mostrarSnackbar('Docente eliminado exitosamente', 'success');
      await cargarDocentes();
    } catch (error) {
      mostrarSnackbar('Error al eliminar docente', 'error');
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Docentes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Docente
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#308be7' }}>
              <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: '#fff' }}>Email</TableCell>
              <TableCell sx={{ color: '#fff' }}>Especialidad</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docentes.map((docente, idx) => (
              <TableRow key={docente.id} sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd' } : { backgroundColor: '#fff' }}>
                <TableCell>{docente.nombre}</TableCell>
                <TableCell>{docente.email}</TableCell>
                <TableCell>{docente.especialidad}</TableCell>
                <TableCell>{docente.estado}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(docente)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleOpenDeleteDialog(docente)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Diálogo para crear/editar docente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDocente ? 'Editar Docente' : 'Nuevo Docente'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Especialidad"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleInputChange}
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
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingDocente ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Diálogo de confirmación para eliminar */}
      {openDeleteDialog && deletingDocente && (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro que desea eliminar al docente "{deletingDocente?.nombre}"?
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocentesList; 