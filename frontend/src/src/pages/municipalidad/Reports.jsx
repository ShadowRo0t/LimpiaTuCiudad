import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { mockUsers } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { Search, Filter, X } from 'lucide-react';

const MunicipalidadReports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAllReports, updateReport, markAsDuplicate, assignReport } = useData();

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'todos',
    priority: searchParams.get('priority') || 'todos',
    category: searchParams.get('category') || 'todos'
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const cuadrillas = mockUsers.filter(u => u.role === 'cuadrilla');

  useEffect(() => {
    const allReports = getAllReports();
    setReports(allReports);

    // Si hay un ID en la URL, seleccionar ese reporte
    const reportId = searchParams.get('id');
    if (reportId) {
      const report = allReports.find(r => r.id === reportId);
      if (report) {
        setSelectedReport(report);
        setShowAssignModal(true);
      }
    }
  }, [getAllReports, searchParams]);

  useEffect(() => {
    let filtered = [...reports];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filters.status !== 'todos') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    // Filtro por prioridad
    if (filters.priority !== 'todos') {
      filtered = filtered.filter(r => r.priority === filters.priority);
    }

    // Filtro por categoría
    if (filters.category !== 'todos') {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, filters]);

  const handleAssign = (cuadrillaId) => {
    if (selectedReport) {
      assignReport(selectedReport.id, cuadrillaId);
      setShowAssignModal(false);
      setSelectedReport(null);
    }
  };

  const handleMarkDuplicate = () => {
    if (selectedReport) {
      markAsDuplicate(selectedReport.id);
      setShowAssignModal(false);
      setSelectedReport(null);
    }
  };

  const handlePriorityChange = (newPriority) => {
    if (selectedReport) {
      updateReport(selectedReport.id, { priority: newPriority });
      setSelectedReport({ ...selectedReport, priority: newPriority });
    }
  };

  const categories = [...new Set(reports.map(r => r.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Reportes</h1>
          <p className="text-gray-600">Administra y asigna los reportes ciudadanos</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID, tipo, dirección..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="en-proceso">En Proceso</option>
              <option value="resuelto">Resueltos</option>
              <option value="rechazado">Rechazados</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todas las prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No se encontraron reportes
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{report.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{report.typeName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-[200px] truncate">
                      {report.description}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-[150px] truncate">
                      {report.address}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={report.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowAssignModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de gestión */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Gestionar Reporte</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedReport(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info del reporte */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{selectedReport.typeName}</h3>
                <p className="text-gray-600 text-sm">{selectedReport.description}</p>
                <p className="text-gray-500 text-sm mt-2">{selectedReport.address}</p>
              </div>

              {/* Estado actual */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estado actual</p>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Prioridad</p>
                  <PriorityBadge priority={selectedReport.priority} />
                </div>
              </div>

              {/* Cambiar prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cambiar Prioridad
                </label>
                <div className="flex gap-2">
                  {['baja', 'media', 'alta', 'critica'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedReport.priority === priority
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asignar cuadrilla */}
              {selectedReport.status !== 'resuelto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar Cuadrilla
                  </label>
                  <div className="space-y-2">
                    {cuadrillas.map(cuadrilla => (
                      <button
                        key={cuadrilla.id}
                        onClick={() => handleAssign(cuadrilla.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedReport.assignedTo === cuadrilla.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{cuadrilla.name}</p>
                        <p className="text-sm text-gray-600">
                          Zona: {cuadrilla.zone} | Especialidad: {cuadrilla.specialty}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Marcar como duplicado */}
              <div>
                <button
                  onClick={handleMarkDuplicate}
                  className="w-full p-4 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Marcar como Duplicado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <p className="text-sm text-gray-500 text-center">
        Mostrando {filteredReports.length} de {reports.length} reportes
      </p>
    </div>
  );
};

export default MunicipalidadReports;
