import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import ReportCard from '../../components/ReportCard';
import { FileText, Filter } from 'lucide-react';

const CiudadanoMyReports = () => {
  const { user } = useAuth();
  const { getUserReports } = useData();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');

  useEffect(() => {
    const userReports = getUserReports(user.id);
    setReports(userReports);
  }, [user.id, getUserReports]);

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    if (filter === 'todos') return true;
    if (filter === 'pendiente') return report.status === 'pendiente';
    if (filter === 'en-proceso') return report.status === 'en-proceso';
    if (filter === 'resuelto') return report.status === 'resuelto';
    return true;
  });

  // Ordenar reportes
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'fecha') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'estado') {
      const statusOrder = { 'pendiente': 0, 'en-proceso': 1, 'resuelto': 2, 'rechazado': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (sortBy === 'prioridad') {
      const priorityOrder = { 'critica': 0, 'alta': 1, 'media': 2, 'baja': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  const statusCounts = {
    todos: reports.length,
    pendiente: reports.filter(r => r.status === 'pendiente').length,
    'en-proceso': reports.filter(r => r.status === 'en-proceso').length,
    resuelto: reports.filter(r => r.status === 'resuelto').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Reportes</h1>
          <p className="text-gray-600">Consulta y sigue el estado de tus reportes</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-gray-500">
          <FileText size={20} />
          <span className="font-medium">{reports.length} reportes</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtro por estado */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {['todos', 'pendiente', 'en-proceso', 'resuelto'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 text-xs opacity-75">({statusCounts[status]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="sm:w-48">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="fecha">Fecha</option>
              <option value="estado">Estado</option>
              <option value="prioridad">Prioridad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reportes */}
      {sortedReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron reportes
          </h3>
          <p className="text-gray-600">
            {filter === 'todos'
              ? 'Comienza creando tu primer reporte'
              : `No hay reportes con estado "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CiudadanoMyReports;
