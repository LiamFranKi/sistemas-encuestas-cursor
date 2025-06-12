import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' }
];

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleOpenDialog = (usuario = null) => {
    setError('');
    setSuccess('');
    if (usuario) {
      setFormData({
        name: usuario.name || '',
        email: usuario.email || '',
        role: usuario.role || 'user'
      });
      setSelectedUsuario(usuario);
    } else {
      setFormData({ name: '', email: '', role: 'user' });
      setSelectedUsuario(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', email: '', role: 'user' });
    setSelectedUsuario(null);
    setError('');
    setSuccess('');
  };

  const handleOpenDeleteDialog = (usuario) => {
    setSelectedUsuario(usuario);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUsuario(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateEmail(formData.email)) {
      setError('El correo electrónico no es válido.');
      return;
    }
    setLoading(true);
    try {
      if (selectedUsuario) {
        await updateDoc(doc(db, 'users', selectedUsuario.id), {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        setSuccess('Usuario actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'users'), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          createdAt: new Date()
        });
        setSuccess('Usuario creado exitosamente');
      }
      handleCloseDialog();
      await cargarUsuarios();
    } catch (err) {
      setError('Error al guardar usuario: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', selectedUsuario.id));
      setSuccess('Usuario eliminado exitosamente');
      await cargarUsuarios();
    } catch (err) {
      setError('Error al eliminar usuario: ' + (err.message || err));
    } finally {
      setLoading(false);
      setSelectedUsuario(null);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : usuarios.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay usuarios registrados
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#308be7' }}>
                <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
                <TableCell sx={{ color: '#fff' }}>Email</TableCell>
                <TableCell sx={{ color: '#fff' }}>Rol</TableCell>
                <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario, idx) => (
                <TableRow key={usuario.id} sx={idx % 2 === 0 ? { backgroundColor: '#e3f2fd' } : { backgroundColor: '#fff' }}>
                  <TableCell>{usuario.name}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{roles.find(r => r.value === usuario.role)?.label || usuario.role}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(usuario)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(usuario)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              type="email"
            />
            <TextField
              select
              fullWidth
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              required
            >
              {roles.map((rol) => (
                <MenuItem key={rol.value} value={rol.value}>
                  {rol.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {selectedUsuario ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar este usuario?
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

export default UsuariosList; 