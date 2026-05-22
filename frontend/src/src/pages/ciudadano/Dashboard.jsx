import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { PlusCircle, FileText, Bell, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import ReportCard from '../../components/ReportCard';
import StatusBadge from '../../components/StatusBadge';

const CiudadanoDashboard = () => {
  const { user } = useAuth();
  const { getUserReports, getStats, unreadNotifications } = useData();
  const [myReports, setMyReports] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const reports = getUserReports(user.id);
    setMyReports(reports);
    setStats(getStats());
  }, [user.id, getUserReports, getStats]);

  if (!myReports) return null;

  const recentReports = myReports.slice(0, 3);
  const pendingReports = myReports.filter(r => r.status === 'pendiente');
  const resolvedReports = myReports.filter(r => r.status === 'resuelto');

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">¡Hola, {user.name.split(' ')[0]}!</h1>
            <p className="text-primary-100">
              {pendingReports.length > 0
                ? `Tienes ${pendingReports.length} reporte(s) pendiente(s) de seguimiento`
                : 'Todos tus reportes están al día'}
            </p>
          </div>
          <Link
            to="/ciudadano/nuevo"
            className="hidden sm:flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-medium hover:bg-primary-50 transition-colors"
          >
            <PlusCircle size={20} />
            <span>Nuevo Reporte</span>
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{myReports.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingReports.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">En Proceso</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {myReports.filter(r => r.status === 'en-proceso').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-green-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Resueltos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{resolvedReports.length}</p>
        </div>
      </div>

      {/* Notificaciones recientes */}
      {unreadNotifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell size={20} className="text-primary-600" />
              Notificaciones
            </h2>
          </div>
          <div className="space-y-3">
            {unreadNotifications.slice(0, 3).map(notif => (
              <div
                key={notif.id}
                className="p-4 bg-primary-50 rounded-lg border border-primary-100"
              >
                <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reportes recientes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
          <Link
            to="/ciudadano/mis-reportes"
            className="text-primary-600 text-sm font-medium hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes reportes aún
            </h3>
            <p className="text-gray-600 mb-6">
              Sé el primero en reportar un problema en tu ciudad
            </p>
            <Link
              to="/ciudadano/nuevo"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <PlusCircle size={20} />
              <span>Crear primer reporte</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante móvil */}
      <Link
        to="/ciudadano/nuevo"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors z-50"
      >
        <PlusCircle size={28} />
      </Link>
    </div>
  );
};

export default CiudadanoDashboard;
