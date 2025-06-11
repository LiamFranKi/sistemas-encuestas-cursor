import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
  ListItemButton
} from '@mui/material';
import { obtenerDocentes, obtenerDocentesPorGrado, actualizarDocentesGrado } from '../../services/escuelaService';
import { useSnackbar } from '../../contexts/SnackbarContext';

const DocentesGradoDialog = ({ open, onClose, grado }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docentes, setDocentes] = useState([]);
  const [selectedDocentes, setSelectedDocentes] = useState([]);
  const { mostrarSnackbar } = useSnackbar();

  const resetState = useCallback(() => {
    setDocentes([]);
    setSelectedDocentes([]);
    setLoading(true);
    setSaving(false);
  }, []);

  const cargarDocentes = useCallback(async () => {
    if (!grado) return;
    
    try {
      setLoading(true);
      const [todosDocentes, docentesGrado] = await Promise.all([
        obtenerDocentes(),
        obtenerDocentesPorGrado(grado.id)
      ]);
      
      setDocentes(todosDocentes);
      const docentesAsignados = docentesGrado.map(docente => docente.id);
      setSelectedDocentes(docentesAsignados);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      mostrarSnackbar('Error al cargar docentes: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [grado, mostrarSnackbar]);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    cargarDocentes();
  }, [open, resetState, cargarDocentes]);

  const handleToggleDocente = useCallback((docenteId) => {
    setSelectedDocentes(prev => {
      const newSelection = prev.includes(docenteId)
        ? prev.filter(id => id !== docenteId)
        : [...prev, docenteId];
      return newSelection;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!grado) return;

    try {
      setSaving(true);
      await actualizarDocentesGrado(grado.id, selectedDocentes);
      mostrarSnackbar('Docentes actualizados exitosamente', 'success');
      onClose();
    } catch (error) {
      console.error('Error al guardar docentes:', error);
      mostrarSnackbar('Error al guardar docentes: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [grado, selectedDocentes, onClose, mostrarSnackbar]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      keepMounted={false}
    >
      <DialogTitle>
        Docentes del Grado: {grado?.nombre}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : docentes.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No hay docentes disponibles
          </Typography>
        ) : (
          <List>
            {docentes.map((docente) => (
              <ListItem key={docente.id} disablePadding>
                <ListItemButton onClick={() => handleToggleDocente(docente.id)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedDocentes.includes(docente.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={docente.nombre}
                    secondary={docente.email}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocentesGradoDialog; 