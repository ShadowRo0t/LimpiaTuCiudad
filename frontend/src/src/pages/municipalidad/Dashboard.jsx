import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Truck
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

const MunicipalidadDashboard = () => {
  const { getAllReports, getStats } = useData();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);

  useEffect(() => {
    const allReports = getAllReports();
    setStats(getStats());
    setRecentReports(allReports.slice(0, 5));
    setPendingAssignments(allReports.filter(r => r.status === 'pendiente' && !r.assignedTo));
  }, [getAllReports, getStats]);

  if (!stats) return null;

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Municipal</h1>
          <p className="text-gray-600">Panel de gestión de incidencias urbanas</p>
        </div>
        <Link
          to="/municipalidad/asignaciones"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Truck size={20} />
          <span>Gestionar Asignaciones</span>
        </Link>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reportes"
          value={stats.total}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={AlertCircle}
          color="bg-yellow-100 text-yellow-600"
          trend={12}
        />
        <StatCard
          title="En Proceso"
          value={stats.enProceso}
          icon={Clock}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Resueltos"
          value={stats.resueltos}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
          trend={8}
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Tiempo promedio de resolución */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tiempo Promedio de Resolución</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-primary-600">{stats.avgResolutionTime}</span>
            <span className="text-gray-600 mb-2">días</span>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full"
              style={{ width: `${Math.min(100, (stats.avgResolutionTime / 7) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Meta: menos de 7 días</p>
        </div>

        {/* Reportes por categoría */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Por Categoría</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory).slice(0, 4).map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos más frecuentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tipos Más Frecuentes</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Asignaciones pendientes */}
      {pendingAssignments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              Asignaciones Pendientes
            </h2>
            <Link
              to="/municipalidad/asignaciones"
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {pendingAssignments.slice(0, 3).map(report => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{report.typeName}</span>
                    <PriorityBadge priority={report.priority} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600">{report.address}</p>
                </div>
                <Link
                  to={`/municipalidad/reportes?id=${report.id}`}
                  className="ml-4 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Asignar
                </Link>
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
            to="/municipalidad/reportes"
            className="text-primary-600 text-sm font-medium hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(report => (
                <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{report.id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{report.typeName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[200px]">
                    {report.address.split(',')[0]}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={report.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={report.priority} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MunicipalidadDashboard;
