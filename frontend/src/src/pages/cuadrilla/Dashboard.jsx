import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ClipboardList, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const CuadrillaDashboard = () => {
  const { user } = useAuth();
  const { getCuadrillaReports, getAllReports } = useData();
  const [assignedReports, setAssignedReports] = useState([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    const reports = getCuadrillaReports(user.id);
    setAssignedReports(reports);
    setPendingTasks(reports.filter(r => r.status === 'en-proceso').length);

    // Contar completadas hoy (simulado)
    const today = new Date().toISOString().split('T')[0];
    const allReports = getAllReports();
    const completed = allReports.filter(
      r => r.assignedTo === user.id &&
           r.status === 'resuelto' &&
           r.resolvedAt?.startsWith(today)
    );
    setCompletedToday(completed.length);
  }, [user.id, getCuadrillaReports, getAllReports]);

  const getTypeIcon = (type) => {
    const icons = {
      'bache': '🛣️',
      'luminaria': '💡',
      'basura': '🗑️',
      'arbol': '🌳',
      'alcantarilla': '🕳️',
      'vereda': '🚶',
      'senalizacion': '🚦',
      'plaga': '🐛',
      'agua': '💧',
      'otro': '📋'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">¡Hola, {user.name}!</h1>
            <p className="text-primary-100">
              {pendingTasks > 0
                ? `Tienes ${pendingTasks} tarea(s) pendiente(s) para hoy`
                : '¡Todas las tareas completadas!'}
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm text-primary-100">Zona</p>
            <p className="text-xl font-bold">{user.zone}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Asignadas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{assignedReports.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Hoy</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedToday}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Especialidad</span>
          </div>
          <p className="text-lg font-bold text-gray-900 capitalize">{user.specialty}</p>
        </div>
      </div>

      {/* Tareas pendientes */}
      {assignedReports.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tareas Asignadas</h2>
            <Link
              to="/cuadrilla/tareas"
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {assignedReports.slice(0, 3).map(report => (
              <Link
                key={report.id}
                to={`/cuadrilla/tarea/${report.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.typeName}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{report.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span className="truncate">{report.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={report.status} size="sm" />
                    {report.priority === 'critica' || report.priority === 'alta' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        {report.priority === 'critica' ? '🔴 Crítica' : '🟠 Alta'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ¡No hay tareas pendientes!
          </h3>
          <p className="text-gray-600">
            Todas las tareas asignadas han sido completadas
          </p>
        </div>
      )}
    </div>
  );
};

export default CuadrillaDashboard;
