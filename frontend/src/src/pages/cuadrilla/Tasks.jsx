import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { MapPin, Navigation, Filter } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

const CuadrillaTasks = () => {
  const { user } = useAuth();
  const { getCuadrillaReports } = useData();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('prioridad');

  useEffect(() => {
    const reports = getCuadrillaReports(user.id);
    setTasks(reports);
  }, [user.id, getCuadrillaReports]);

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'todos') return true;
    if (filter === 'pendiente') return task.status === 'en-proceso';
    if (filter === 'completada') return task.status === 'resuelto';
    return true;
  });

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'prioridad') {
      const priorityOrder = { 'critica': 0, 'alta': 1, 'media': 2, 'baja': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === 'fecha') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  });

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

  // Calcular ruta óptima (simplificado)
  const optimizeRoute = () => {
    // En producción, esto usaría un algoritmo de routing real
    const prioritarias = sortedTasks.filter(t => t.priority === 'critica' || t.priority === 'alta');
    const normales = sortedTasks.filter(t => t.priority === 'media');
    const bajas = sortedTasks.filter(t => t.priority === 'baja');

    return [...prioritarias, ...normales, ...bajas];
  };

  const optimizedTasks = sortBy === 'ruta' ? optimizeRoute() : sortedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Tareas</h1>
          <p className="text-gray-600">Lista de trabajos asignados y rutas</p>
        </div>
      </div>

      {/* Filtros y orden */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtro por estado */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'pendiente', label: 'Pendientes' },
                { id: 'completada', label: 'Completadas' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === item.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
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
              <option value="prioridad">Prioridad</option>
              <option value="fecha">Fecha de asignación</option>
              <option value="ruta">Ruta óptima</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de ruta óptima */}
      {sortBy === 'ruta' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Navigation className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-blue-900">Ruta Optimizada</h3>
            <p className="text-sm text-blue-700 mt-1">
              Las tareas están ordenadas por prioridad y proximidad para optimizar tu recorrido.
              Comienza por las tareas críticas y altas.
            </p>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      {optimizedTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-gray-400" size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay tareas
          </h3>
          <p className="text-gray-600">
            {filter === 'todos'
              ? 'No tienes tareas asignadas en este momento'
              : `No hay tareas ${filter === 'pendiente' ? 'pendientes' : 'completadas'}`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimizedTasks.map((task, index) => (
            <Link
              key={task.id}
              to={`/cuadrilla/tarea/${task.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Número de orden (solo en modo ruta) */}
                {sortBy === 'ruta' && (
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                )}

                {/* Icono y info */}
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{getTypeIcon(task.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{task.typeName}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span className="truncate max-w-[200px]">{task.address}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={task.status} size="sm" />
                  <PriorityBadge priority={task.priority} size="sm" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Contador */}
      <p className="text-sm text-gray-500 text-center">
        {optimizedTasks.length} tarea(s) mostrada(s)
      </p>
    </div>
  );
};

export default CuadrillaTasks;
