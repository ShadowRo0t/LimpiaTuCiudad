import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { mockUsers, getReportsByZone, calculateDistance } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { Truck, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const MunicipalidadAssignments = () => {
  const { getAllReports, assignReport, getStats } = useData();
  const [reports, setReports] = useState([]);
  const [cuadrillas, setCuadrillas] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [autoAssignMode, setAutoAssignMode] = useState(false);

  useEffect(() => {
    const allReports = getAllReports();
    setReports(allReports);
    setPendingReports(allReports.filter(r => r.status === 'pendiente' && !r.assignedTo));
    setCuadrillas(mockUsers.filter(u => u.role === 'cuadrilla'));
  }, [getAllReports]);

  // Auto-asignación inteligente
  const getBestCuadrilla = (report) => {
    // Filtrar cuadrillas por especialidad
    const suitableCuadrillas = cuadrillas.filter(c =>
      c.specialty === report.category || c.specialty === 'limpieza' // limpieza es comodín
    );

    if (suitableCuadrillas.length === 0) return cuadrillas[0];

    // Calcular distancia a cada cuadrilla (simplificado)
    let bestCuadrilla = suitableCuadrillas[0];
    let minDistance = Infinity;

    suitableCuadrillas.forEach(cuadrilla => {
      // En producción, usaríamos la ubicación real de la cuadrilla
      const zoneReports = getReportsByZone(reports, cuadrilla.zone);
      const avgLocation = zoneReports.length > 0
        ? {
            lat: zoneReports.reduce((sum, r) => sum + r.location.lat, 0) / zoneReports.length,
            lng: zoneReports.reduce((sum, r) => sum + r.location.lng, 0) / zoneReports.length
          }
        : null;

      if (avgLocation) {
        const distance = calculateDistance(report.location, avgLocation);
        if (distance < minDistance) {
          minDistance = distance;
          bestCuadrilla = cuadrilla;
        }
      }
    });

    return bestCuadrilla;
  };

  const handleAutoAssign = () => {
    setAutoAssignMode(true);

    pendingReports.forEach((report, index) => {
      setTimeout(() => {
        const bestCuadrilla = getBestCuadrilla(report);
        assignReport(report.id, bestCuadrilla.id);
        setPendingReports(prev => prev.filter(r => r.id !== report.id));

        // Último reporte, terminar modo auto
        if (index === pendingReports.length - 1) {
          setTimeout(() => setAutoAssignMode(false), 1000);
        }
      }, index * 500);
    });
  };

  const handleManualAssign = (reportId, cuadrillaId) => {
    assignReport(reportId, cuadrillaId);
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    setSelectedReport(null);
  };

  // Reportes asignados por cuadrilla
  const getAssignedReports = (cuadrillaId) => {
    return reports.filter(r =>
      r.assignedTo === cuadrillaId &&
      r.status === 'en-proceso'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Asignación de Cuadrillas</h1>
          <p className="text-gray-600">Gestiona la asignación de reportes a las cuadrillas</p>
        </div>
        {pendingReports.length > 0 && (
          <button
            onClick={handleAutoAssign}
            disabled={autoAssignMode}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle size={20} />
            <span>
              {autoAssignMode
                ? 'Asignando...'
                : `Auto-asignar ${pendingReports.length} reporte(s)`}
            </span>
          </button>
        )}
      </div>

      {/* Reportes pendientes */}
      {pendingReports.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">
              Reportes Pendientes de Asignación ({pendingReports.length})
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingReports.map(report => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900">{report.typeName}</span>
                  <PriorityBadge priority={report.priority} size="sm" />
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <MapPin size={14} />
                  <span className="truncate">{report.address.split(',')[0]}</span>
                </div>
                <button
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  className="w-full py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  {selectedReport?.id === report.id ? 'Cancelar' : 'Asignar'}
                </button>

                {/* Panel de asignación */}
                {selectedReport?.id === report.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Seleccionar cuadrilla:</p>
                    <div className="space-y-2">
                      {cuadrillas.map(cuadrilla => {
                        const isBestMatch = getBestCuadrilla(report).id === cuadrilla.id;
                        return (
                          <button
                            key={cuadrilla.id}
                            onClick={() => handleManualAssign(report.id, cuadrilla.id)}
                            className={`w-full p-2 rounded border text-left text-sm transition-colors ${
                              isBestMatch
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-medium text-gray-900">{cuadrilla.name}</p>
                            <p className="text-xs text-gray-600">
                              {cuadrilla.zone} • {cuadrilla.specialty}
                              {isBestMatch && ' • ⭐ Recomendada'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cuadrillas y sus tareas */}
      <div className="grid lg:grid-cols-3 gap-6">
        {cuadrillas.map(cuadrilla => {
          const assignedReports = getAssignedReports(cuadrilla.id);
          return (
            <div key={cuadrilla.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cuadrilla.name}</h3>
                  <p className="text-sm text-gray-600">Zona {cuadrilla.zone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Miembros</p>
                  <p className="font-medium text-gray-900">{cuadrilla.members}</p>
                </div>
                <div>
                  <p className="text-gray-500">Especialidad</p>
                  <p className="font-medium text-gray-900 capitalize">{cuadrilla.specialty}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tareas</p>
                  <p className="font-medium text-primary-600">{assignedReports.length}</p>
                </div>
              </div>

              {assignedReports.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Sin tareas asignadas
                </p>
              ) : (
                <div className="space-y-2">
                  {assignedReports.map(report => (
                    <div
                      key={report.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{report.typeName}</span>
                        <StatusBadge status={report.status} size="sm" />
                      </div>
                      <p className="text-xs text-gray-600 truncate">{report.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <PriorityBadge priority={report.priority} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MunicipalidadAssignments;
