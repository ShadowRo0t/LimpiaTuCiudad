import { createContext, useContext, useState, useEffect } from 'react';
import { mockReports, mockNotifications } from '../data/mockData';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde localStorage o usar mock
  useEffect(() => {
    const storedReports = localStorage.getItem('ltc_reports');
    const storedNotifications = localStorage.getItem('ltc_notifications');

    if (storedReports) {
      setReports(JSON.parse(storedReports));
    } else {
      setReports(mockReports);
      localStorage.setItem('ltc_reports', JSON.stringify(mockReports));
    }

    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    } else {
      setNotifications(mockNotifications);
      localStorage.setItem('ltc_notifications', JSON.stringify(mockNotifications));
    }

    setLoading(false);
  }, []);

  // Guardar reports cuando cambien
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ltc_reports', JSON.stringify(reports));
    }
  }, [reports, loading]);

  // Guardar notificaciones cuando cambien
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ltc_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  // Crear nuevo reporte
  const createReport = async (reportData) => {
    // Estructurar el reporte para que sea compatible con el backend de Go y MongoDB
    // MongoDB espera GeoPoint: { type: "Point", coordinates: [lng, lat] }
    // En el frontend se maneja location: { lat, lng }
    const backendReport = {
      user_id: reportData.userId, // mapea a user_id en MongoDB
      type: reportData.type,
      typeName: reportData.typeName,
      category: reportData.category,
      description: reportData.description,
      address: reportData.address,
      location: {
        type: "Point",
        coordinates: [reportData.location.lng, reportData.location.lat] // GeoJSON [longitud, latitud]
      },
      photos: reportData.photos ? reportData.photos.map(p => ({ key: p, url: p })) : [],
      status: "pendiente",
      priority: reportData.priority,
      isDuplicate: false
    };

    try {
      // Intentar guardar en la API real de Go
      const response = await fetch("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(backendReport)
      });

      if (response.ok) {
        const savedReport = await response.json();
        // Convertir el formato del backend al formato plano usado en el frontend
        const frontendFormattedReport = {
          id: savedReport.id,
          userId: savedReport.userID,
          type: savedReport.type,
          typeName: savedReport.typeName,
          category: savedReport.category,
          description: savedReport.description,
          address: savedReport.address,
          location: {
            lat: savedReport.location.coordinates[1],
            lng: savedReport.location.coordinates[0]
          },
          photos: savedReport.photos ? savedReport.photos.map(p => p.key) : [],
          status: savedReport.status,
          priority: savedReport.priority,
          createdAt: savedReport.createdAt,
          updatedAt: savedReport.updatedAt,
          isDuplicate: savedReport.isDuplicate
        };

        setReports(prev => [frontendFormattedReport, ...prev]);
        return frontendFormattedReport;
      }
    } catch (error) {
      console.warn("La API del Backend está inactiva, usando simulación en localStorage:", error);
    }

    // Fallback: simulación offline usando localStorage si el backend de Go no responde
    const newReport = {
      id: `rep-${Date.now()}`,
      ...reportData,
      status: 'pendiente',
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      isDuplicate: false
    };

    setReports(prev => [newReport, ...prev]);
    return newReport;
  };


  // Actualizar reporte
  const updateReport = (id, updates) => {
    setReports(prev => prev.map(report =>
      report.id === id
        ? { ...report, ...updates, updatedAt: new Date().toISOString() }
        : report
    ));
  };

  // Asignar reporte a cuadrilla
  const assignReport = (reportId, cuadrillaId) => {
    updateReport(reportId, {
      assignedTo: cuadrillaId,
      status: 'en-proceso'
    });
  };

  // Marcar reporte como resuelto
  const resolveReport = (reportId, resolutionData) => {
    updateReport(reportId, {
      status: 'resuelto',
      resolvedAt: new Date().toISOString(),
      ...resolutionData
    });
  };

  // Marcar reporte como duplicado
  const markAsDuplicate = (reportId) => {
    updateReport(reportId, { isDuplicate: true, status: 'rechazado' });
  };

  // Crear notificación
  const createNotification = (notificationData) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      ...notificationData,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  // Marcar notificación como leída
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  // Marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Obtener notificaciones no leídas
  const unreadNotifications = notifications.filter(n => !n.read);

  // Obtener reports por usuario
  const getUserReports = (userId) => {
    return reports.filter(r => r.userId === userId);
  };

  // Obtener reports asignados a cuadrilla
  const getCuadrillaReports = (cuadrillaId) => {
    return reports.filter(r => r.assignedTo === cuadrillaId && r.status !== 'resuelto');
  };

  // Obtener todos los reports (para municipalidad)
  const getAllReports = () => {
    return reports;
  };

  // Obtener report por ID
  const getReportById = (id) => {
    return reports.find(r => r.id === id);
  };

  // Estadísticas para dashboard
  const getStats = () => {
    const total = reports.length;
    const pendientes = reports.filter(r => r.status === 'pendiente').length;
    const enProceso = reports.filter(r => r.status === 'en-proceso').length;
    const resueltos = reports.filter(r => r.status === 'resuelto').length;
    const duplicados = reports.filter(r => r.isDuplicate).length;

    // Tiempo promedio de resolución (en días)
    const resolvedReports = reports.filter(r => r.resolvedAt);
    const avgResolutionTime = resolvedReports.length > 0
      ? resolvedReports.reduce((acc, r) => {
          const created = new Date(r.createdAt);
          const resolved = new Date(r.resolvedAt);
          return acc + (resolved - created) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedReports.length
      : 0;

    // Reportes por categoría
    const byCategory = reports.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    // Reportes por tipo
    const byType = reports.reduce((acc, r) => {
      acc[r.typeName] = (acc[r.typeName] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      pendientes,
      enProceso,
      resueltos,
      duplicados,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      byCategory,
      byType
    };
  };

  const value = {
    reports,
    notifications,
    loading,
    createReport,
    updateReport,
    assignReport,
    resolveReport,
    markAsDuplicate,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotifications,
    getUserReports,
    getCuadrillaReports,
    getAllReports,
    getReportById,
    getStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
