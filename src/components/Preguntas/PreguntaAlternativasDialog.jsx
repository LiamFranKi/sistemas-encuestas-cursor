import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, List, ListItem, ListItemText, ListItemIcon, CircularProgress, Typography } from '@mui/material';
import { getAlternativas, getAlternativasByPregunta, setAlternativasToPregunta } from '../../services/preguntaAlternativaService';

const PreguntaAlternativasDialog = ({ open, onClose, pregunta }) => {
  const [alternativas, setAlternativas] = useState([]);
  const [checked, setChecked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && pregunta) {
      setLoading(true);
      Promise.all([
        getAlternativas(),
        getAlternativasByPregunta(pregunta.id)
      ]).then(([todas, asignadas]) => {
        setAlternativas(todas);
        setChecked(asignadas.map(a => a.alternativa_id));
        setLoading(false);
      });
    }
  }, [open, pregunta]);

  const handleToggle = (id) => {
    setChecked(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGuardar = async () => {
    setLoading(true);
    await setAlternativasToPregunta(pregunta.id, checked);
    setLoading(false);
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        Alternativas de la Pregunta: {pregunta?.texto || ''}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : alternativas.length === 0 ? (
          <Typography color="textSecondary">No hay alternativas disponibles</Typography>
        ) : (
          <List>
            {alternativas.map(alt => (
              <ListItem key={alt.id} button onClick={() => handleToggle(alt.id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.includes(alt.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={alt.texto_alternativa} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancelar</Button>
        <Button onClick={handleGuardar} variant="contained" disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreguntaAlternativasDialog; 