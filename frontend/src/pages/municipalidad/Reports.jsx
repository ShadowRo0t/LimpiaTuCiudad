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
  const [showBoxes, setShowBoxes] = useState(true);

  const cuadrillas = mockUsers.filter(u => u.role === 'cuadrilla');

  // Calcula el ranking de gravedad del reporte de árbol frente a los demás activos
  const getTreeReportRank = (report) => {
    if (report.type !== 'arbol') return null;
    const treeReports = reports
      .filter(r => r.type === 'arbol' && r.status !== 'resuelto' && r.status !== 'rechazado' && r.aiAnalysis)
      .map(r => {
        let score = 0;
        if (r.aiAnalysis.dangerLevel === 'critica') score = 40;
        else if (r.aiAnalysis.dangerLevel === 'alta') score = 30;
        else if (r.aiAnalysis.dangerLevel === 'media') score = 20;
        else score = 10;
        
        // Desempate por antigüedad (más antiguo = más prioridad)
        const timeScore = (2000000000000 - new Date(r.createdAt).getTime()) / 10000000000;
        return { id: r.id, score: score + timeScore };
      })
      .sort((a, b) => b.score - a.score);
      
    const rankIndex = treeReports.findIndex(r => r.id === report.id);
    return {
      rank: rankIndex !== -1 ? rankIndex + 1 : 1,
      total: treeReports.length || 1,
      percentile: rankIndex !== -1 ? Math.round(((treeReports.length - rankIndex) / treeReports.length) * 100) : 100
    };
  };

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

              {/* Panel de Detección de Árboles Caídos por IA para la Municipalidad */}
              {selectedReport.aiAnalysis && selectedReport.aiAnalysis.performed && (
                <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-4 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded font-mono">OWL-ViT DETECTOR</span>
                      <h4 className="font-bold text-xs font-mono text-slate-200">INFORME TÉCNICO DE IA</h4>
                    </div>
                    <button 
                      onClick={() => setShowBoxes(!showBoxes)}
                      className="text-[10px] font-mono text-emerald-400 underline hover:text-emerald-300"
                    >
                      {showBoxes ? 'Ocultar Cajas' : 'Ver Cajas'}
                    </button>
                  </div>

                  {/* Imagen y Bounding Boxes en miniatura */}
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={selectedReport.photos[0] && (selectedReport.photos[0].startsWith('data:') || selectedReport.photos[0].startsWith('blob:'))
                        ? selectedReport.photos[0] 
                        : 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'}
                      alt="Detección de IA"
                      className="w-full h-full object-cover opacity-90"
                    />
                    
                    {showBoxes && selectedReport.aiAnalysis.objects && (
                      <div className="absolute inset-0 pointer-events-none">
                        {selectedReport.aiAnalysis.objects.map((obj, i) => {
                          const [ymin, xmin, ymax, xmax] = obj.box;
                          let borderClass = 'border-emerald-400 text-emerald-400 bg-slate-950/80';
                          if (obj.label.includes('cable') || obj.label.includes('eléctrico')) {
                            borderClass = 'border-red-500 text-red-400 bg-red-950/80';
                          } else if (obj.label.includes('vehículo') || obj.label.includes('auto') || obj.label.includes('propiedad')) {
                            borderClass = 'border-yellow-500 text-yellow-400 bg-yellow-950/80';
                          } else if (obj.label.includes('calle') || obj.label.includes('vereda')) {
                            borderClass = 'border-sky-400 text-sky-400 bg-sky-950/80';
                          }
                          return (
                            <div
                              key={i}
                              className={`absolute border-2 rounded ${borderClass}`}
                              style={{
                                top: `${ymin}%`,
                                left: `${xmin}%`,
                                width: `${xmax - xmin}%`,
                                height: `${ymax - ymin}%`
                              }}
                            >
                              <span className="absolute -top-4 left-0 px-1 py-0.5 text-[7px] font-mono font-bold rounded shadow-md border border-inherit">
                                {obj.label} ({Math.round(obj.confidence * 100)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Comparador de Riesgo con existentes */}
                  {(() => {
                    const rankInfo = getTreeReportRank(selectedReport);
                    if (!rankInfo) return null;
                    return (
                      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-400">Riesgo Comparativo:</span>
                          <span className="text-emerald-400 font-bold">Puesto {rankInfo.rank} de {rankInfo.total}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full animate-pulse" 
                            style={{ width: `${rankInfo.percentile}%` }} 
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Ubicado en el <strong className="text-emerald-400">{rankInfo.percentile}%</strong> más severo de los árboles caídos activos. Prioridad aconsejada.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Métricas breves */}
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-800/50">
                      <p className="text-[8px] text-slate-400">TAMAÑO</p>
                      <p className="text-xs font-bold text-slate-200 capitalize">{selectedReport.aiAnalysis.treeSize}</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-800/50">
                      <p className="text-[8px] text-slate-400">OBSTRUCCIÓN</p>
                      <p className="text-xs font-bold text-slate-200 capitalize truncate">{selectedReport.aiAnalysis.obstruction.replace('bloqueo de ', '')}</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-800/50">
                      <p className="text-[8px] text-slate-400">DAÑO</p>
                      <p className="text-xs font-bold text-slate-200 capitalize truncate">{selectedReport.aiAnalysis.damage.replace('daño a ', '')}</p>
                    </div>
                  </div>

                  {/* Explicación / Justificación */}
                  <div className="bg-slate-950/80 border border-slate-800/50 p-3 rounded-lg text-xs leading-relaxed text-slate-300">
                    <strong className="text-slate-400 block font-mono text-[9px] mb-1">JUSTIFICACIÓN TÉCNICA DEL MODELO:</strong>
                    {selectedReport.aiAnalysis.reason}
                  </div>
                </div>
              )}

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
