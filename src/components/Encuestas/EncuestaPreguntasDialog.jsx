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
import { obtenerPreguntas, obtenerPreguntasPorEncuesta, actualizarPreguntasEncuesta } from '../../services/escuelaService';
import { useSnackbar } from '../../contexts/SnackbarContext';

const EncuestaPreguntasDialog = ({ open, onClose, encuesta }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preguntas, setPreguntas] = useState([]);
  const [selectedPreguntas, setSelectedPreguntas] = useState([]);
  const { mostrarSnackbar } = useSnackbar();

  const resetState = useCallback(() => {
    setPreguntas([]);
    setSelectedPreguntas([]);
    setLoading(true);
    setSaving(false);
  }, []);

  const cargarPreguntas = useCallback(async () => {
    if (!encuesta) return;
    try {
      setLoading(true);
      const [todasPreguntas, preguntasEncuesta] = await Promise.all([
        obtenerPreguntas(),
        obtenerPreguntasPorEncuesta(encuesta.id)
      ]);
      setPreguntas(todasPreguntas);
      const preguntasAsignadas = preguntasEncuesta.map(p => p.pregunta_id);
      setSelectedPreguntas(preguntasAsignadas);
    } catch (error) {
      mostrarSnackbar('Error al cargar preguntas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [encuesta, mostrarSnackbar]);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    cargarPreguntas();
  }, [open, resetState, cargarPreguntas]);

  const handleTogglePregunta = useCallback((preguntaId) => {
    setSelectedPreguntas(prev => {
      const newSelection = prev.includes(preguntaId)
        ? prev.filter(id => id !== preguntaId)
        : [...prev, preguntaId];
      return newSelection;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!encuesta) return;
    try {
      setSaving(true);
      await actualizarPreguntasEncuesta(encuesta.id, selectedPreguntas);
      mostrarSnackbar('Preguntas actualizadas exitosamente', 'success');
      onClose();
    } catch (error) {
      mostrarSnackbar('Error al guardar preguntas: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [encuesta, selectedPreguntas, onClose, mostrarSnackbar]);

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
        Preguntas de la Encuesta: {encuesta?.titulo}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : preguntas.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No hay preguntas disponibles
          </Typography>
        ) : (
          <List>
            {preguntas.map((pregunta) => (
              <ListItem key={pregunta.id} disablePadding>
                <ListItemButton onClick={() => handleTogglePregunta(pregunta.id)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedPreguntas.includes(pregunta.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={pregunta.texto_pregunta}
                    secondary={pregunta.tipo_pregunta}
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

export default EncuestaPreguntasDialog; 