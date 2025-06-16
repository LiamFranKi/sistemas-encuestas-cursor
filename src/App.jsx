import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './components/Dashboard/Dashboard';
import GradosList from './components/Grados/GradosList';
import DocentesList from './components/Docentes/DocentesList';
import EncuestasList from './components/Encuestas/EncuestasList';
import PreguntasList from './components/Preguntas/PreguntasList';
import AlternativasList from './components/Alternativas/AlternativasList';
import LandingPage from './pages/LandingPage';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          currentUser ? (
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/grados"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <GradosList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/docentes"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <DocentesList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/encuestas"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <EncuestasList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
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
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 