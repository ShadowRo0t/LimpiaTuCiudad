// Utilidades para almacenamiento local y modo offline

const STORAGE_KEYS = {
  REPORTS: 'ltc_reports',
  NOTIFICATIONS: 'ltc_notifications',
  USER: 'ltc_user',
  PENDING_ACTIONS: 'ltc_pending_actions'
};

// Guardar datos en localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
};

// Obtener datos de localStorage
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error leyendo de localStorage:', error);
    return defaultValue;
  }
};

// Eliminar datos de localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error eliminando de localStorage:', error);
    return false;
  }
};

// Limpiar todo el almacenamiento
export const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error limpiando almacenamiento:', error);
    return false;
  }
};

// Guardar acción pendiente para sincronización offline
export const addPendingAction = (action) => {
  const pending = getFromStorage(STORAGE_KEYS.PENDING_ACTIONS, []);
  pending.push({ ...action, timestamp: Date.now() });
  saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, pending);
};

// Obtener acciones pendientes
export const getPendingActions = () => {
  return getFromStorage(STORAGE_KEYS.PENDING_ACTIONS, []);
};

// Eliminar acción pendiente después de sincronizar
export const removePendingAction = (index) => {
  const pending = getFromStorage(STORAGE_KEYS.PENDING_ACTIONS, []);
  pending.splice(index, 1);
  saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, pending);
};

// Verificar si hay conexión
export const isOnline = () => navigator.onLine;

// Obtener estado de almacenamiento
export const getStorageInfo = () => {
  const info = {
    reports: getFromStorage(STORAGE_KEYS.REPORTS, []).length,
    notifications: getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []).length,
    pendingActions: getFromStorage(STORAGE_KEYS.PENDING_ACTIONS, []).length,
    user: getFromStorage(STORAGE_KEYS.USER) ? true : false
  };

  // Calcular tamaño aproximado
  let totalSize = 0;
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += item.length * 2; // ~2 bytes por caracter en UTF-16
    }
  });

  info.totalSize = `${(totalSize / 1024).toFixed(2)} KB`;

  return info;
};

// Exportar datos para backup
export const exportData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = getFromStorage(key);
  });
  return data;
};

// Importar datos desde backup
export const importData = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) {
      saveToStorage(key, value);
    }
  });
};
