import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Ejecutar acciones pendientes cuando se recupera la conexión
      if (pendingActions.length > 0) {
        // Aquí se podrían ejecutar las acciones pendientes
        console.log('Conexión restaurada, acciones pendientes:', pendingActions.length);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions.length]);

  const addPendingAction = (action) => {
    setPendingActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const clearPendingActions = () => {
    setPendingActions([]);
  };

  return {
    isOffline,
    pendingActions,
    addPendingAction,
    clearPendingActions
  };
};
