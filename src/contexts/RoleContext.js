import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  return useContext(RoleContext);
};

export const RoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Buscar en la colección users
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || 'user');
        } else {
          // Si no está en users, verificar si es admin
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setUserRole('admin');
          } else {
            setUserRole('user'); // Rol por defecto
          }
        }
      } catch (error) {
        console.error('Error al obtener rol del usuario:', error);
        setUserRole('user'); // Rol por defecto en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasPermission = (requiredRole) => {
    if (!userRole) return false;
    
    // Jerarquía de roles: admin > user
    const roleHierarchy = {
      'admin': 2,
      'user': 1
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const value = {
    userRole,
    loading,
    hasPermission,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user'
  };

  return (
    <RoleContext.Provider value={value}>
      {!loading && children}
    </RoleContext.Provider>
  );
}; 