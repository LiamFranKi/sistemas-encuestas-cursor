import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { login } from '../../services/authService';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // El redirect lo maneja el useEffect
    } catch (error) {
      console.error('Error de login:', error);
      let errorMessage = 'Error al iniciar sesión';
      if (error.code === 'auth/api-key-not-valid') {
        errorMessage = 'Error de configuración. Por favor, contacte al administrador.';
      } else {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
            break;
          default:
            errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente';
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Container component="main" maxWidth="xs" sx={{ zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#308be7',
              letterSpacing: 1.5,
              textShadow: '0 2px 8px #e0e7ff',
            }}
            gutterBottom
          >
            Sistema de Encuestas
          </Typography>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
              boxShadow: '0 8px 32px 0 rgba(48,139,231,0.10)',
            }}
          >
            <Typography component="h2" variant="h6" sx={{ mb: 2, color: '#308be7', fontWeight: 600 }}>
              Iniciar Sesión
            </Typography>
            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(90deg, #308be7 0%, #67e8f9 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 16px 0 rgba(48,139,231,0.15)',
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)',
                  },
                }}
                disabled={loading}
              >
                Iniciar Sesión
              </Button>
            </Box>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={32} color="primary" />
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 