import React, { createContext, useContext, useEffect, useState } from 'react';
import { getEncuestaActiva } from '../services/firestore';

const EncuestaActivaContext = createContext();

export const useEncuestaActiva = () => useContext(EncuestaActivaContext);

export const EncuestaActivaProvider = ({ children }) => {
  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEncuesta = async () => {
      try {
        const encuestaActiva = await getEncuestaActiva();
        setEncuesta(encuestaActiva);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEncuesta();
  }, []);

  return (
    <EncuestaActivaContext.Provider value={{ encuesta, loading, error }}>
      {children}
    </EncuestaActivaContext.Provider>
  );
}; 