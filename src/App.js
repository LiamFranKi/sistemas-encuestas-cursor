import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';
import { theme } from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardLayout from './components/Layout/DashboardLayout';
import GradosList from './components/Grados/GradosList';
import DocentesList from './components/Docentes/DocentesList';
import EncuestasList from './components/Encuestas/EncuestasList';
import PreguntasList from './components/Preguntas/PreguntasList';
import AlternativasList from './components/Alternativas/AlternativasList';
import UsuariosList from './components/Usuarios/UsuariosList';
import EstadisticasList from './components/Estadisticas/EstadisticasList';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/grados" element={
        <PrivateRoute>
          <DashboardLayout>
            <GradosList />
          </DashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/docentes" element={
        <PrivateRoute>
          <DashboardLayout>
            <DocentesList />
          </DashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/encuestas" element={
        <PrivateRoute>
          <DashboardLayout>
            <EncuestasList />
          </DashboardLayout>
        </PrivateRoute>
      } />   
      <Route
        path="/preguntas"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <PreguntasList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/alternativas"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AlternativasList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route path="/usuarios" element={
        <PrivateRoute>
          <DashboardLayout>
            <UsuariosList />
          </DashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/estadisticas" element={
        <PrivateRoute>
          <DashboardLayout>
            <EstadisticasList />
          </DashboardLayout>
        </PrivateRoute>
      } />
    </Routes>
    
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SnackbarProvider>
            <Router>
              <AppRoutes />
            </Router>
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
