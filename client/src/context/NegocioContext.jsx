import { createContext, useState, useEffect } from 'react';
import { negocioService } from '../services/negocio.service';
import { useAuth } from '../hooks/useAuth';

export const NegocioContext = createContext(null);

export function NegocioProvider({ children }) {
  const { user } = useAuth();
  const [negocio, setNegocio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.negocio_id) return;
    setIsLoading(true);
    negocioService
      .obtener(user.negocio_id)
      .then(setNegocio)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.negocio_id]);

  const actualizarNegocio = (data) => setNegocio((prev) => ({ ...prev, ...data }));

  return (
    <NegocioContext.Provider value={{ negocio, isLoading, actualizarNegocio }}>
      {children}
    </NegocioContext.Provider>
  );
}
