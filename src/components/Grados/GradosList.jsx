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
  Tooltip,
  CircularProgress,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { 
  obtenerGrados, 
  crearGrado, 
  actualizarGrado, 
  eliminarGrado 
} from '../../services/escuelaService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import DocentesGradoDialog from './DocentesGradoDialog';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const GradosList = () => {
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDocentesDialog, setOpenDocentesDialog] = useState(false);
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nivel: '',
    estado: 'activo'
  });
  const { mostrarSnackbar } = useSnackbar();
  const [maestrosPorGrado, setMaestrosPorGrado] = useState({});
  const [modoFormulario, setModoFormulario] = useState('crear');

  const cargarGrados = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error('Error al cargar grados:', error);
      mostrarSnackbar('Error al cargar grados: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [mostrarSnackbar]);

  useEffect(() => {
    const cargarGradosYMaestros = async () => {
      setLoading(true);
      try {
        const gradosData = await obtenerGrados();
        setGrados(gradosData);
        // Obtener relaciones grado-docente
        const relacionesSnap = await getDocs(collection(db, 'grados_docentes'));
        const conteo = {};
        relacionesSnap.forEach((doc) => {
          const data = doc.data();
          if (data.gradoId) {
            conteo[data.gradoId] = (conteo[data.gradoId] || 0) + 1;
          }
        });
        setMaestrosPorGrado(conteo);
      } catch (error) {
        mostrarSnackbar('Error al cargar grados o maestros', 'error');
      } finally {
        setLoading(false);
      }
    };
    cargarGradosYMaestros();
  }, [mostrarSnackbar]);

  const handleOpenDialog = (grado = null) => {
    setOpenDialog(false);
    if (grado) {
      setFormData({
        nombre: grado.nombre || '',
        nivel: grado.nivel || '',
        estado: grado.estado || 'activo'
      });
      setSelectedGrado(grado);
      setModoFormulario('editar');
    } else {
      setFormData({ nombre: '', nivel: '', estado: 'activo' });
      setSelectedGrado(null);
      setModoFormulario('crear');
    }
    setTimeout(() => setOpenDialog(true), 0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nombre: '',
      nivel: '',
      estado: 'activo'
    });
    setSelectedGrado(null);
  };

  const handleOpenDeleteDialog = (grado) => {
    setSelectedGrado(grado);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedGrado(null);
  };

  const handleOpenDocentesDialog = (grado) => {
    setSelectedGrado(grado);
    setOpenDocentesDialog(true);
  };

  const handleCloseDocentesDialog = () => {
    setOpenDocentesDialog(false);
    setSelectedGrado(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modoFormulario === 'editar' && selectedGrado) {
        await actualizarGrado(selectedGrado.id, { ...formData });
        mostrarSnackbar('Grado actualizado exitosamente');
      } else {
        await crearGrado({ ...formData });
        mostrarSnackbar('Grado creado exitosamente');
      }
      handleCloseDialog();
      await cargarGrados();
    } catch (error) {
      mostrarSnackbar('Error al guardar grado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const gradoAEliminar = selectedGrado;
    handleCloseDeleteDialog();
    try {
      await eliminarGrado(gradoAEliminar.id);
      mostrarSnackbar('Grado eliminado exitosamente', 'success');
      await cargarGrados();
    } catch (error) {
      console.error('Error al eliminar grado:', error);
      mostrarSnackbar('Error al eliminar grado: ' + error.message, 'error');
    }
  };

  console.log('modoFormulario:', modoFormulario, 'selectedGrado:', selectedGrado);

  if (loading && grados.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Grados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null)}
        >
          Nuevo Grado
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Maestros</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grados
              .slice()
              .sort((a, b) => {
                if (a.nivel < b.nivel) return -1;
                if (a.nivel > b.nivel) return 1;
                if (a.nombre < b.nombre) return -1;
                if (a.nombre > b.nombre) return 1;
                return 0;
              })
              .map((grado) => (
                <TableRow key={grado.id}>
                  <TableCell>{grado.nombre}</TableCell>
                  <TableCell>{grado.nivel}</TableCell>
                  <TableCell>{grado.estado}</TableCell>
                  <TableCell align="center">{maestrosPorGrado[grado.id] || 0}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(grado)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(grado)}>
                      <DeleteIcon />
                    </IconButton>
                    <Tooltip title="Gestionar Docentes">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDocentesDialog(grado)}
                          color="info"
                          disabled={loading}
                        >
                          <PeopleIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para crear/editar grado */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{modoFormulario === 'editar' ? 'Editar Grado' : 'Nuevo Grado'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Nivel"
              name="nivel"
              value={formData.nivel}
              onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
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
              {modoFormulario === 'editar' ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      {openDeleteDialog && selectedGrado && (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro que desea eliminar el grado "{selectedGrado?.nombre}"?
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

      {/* Diálogo para gestionar docentes */}
      <DocentesGradoDialog
        open={openDocentesDialog}
        onClose={handleCloseDocentesDialog}
        grado={selectedGrado}
      />
    </Box>
  );
};

export default GradosList; 