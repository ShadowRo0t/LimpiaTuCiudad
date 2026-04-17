import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import MapComponent from '../../components/MapComponent';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Image,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CiudadanoReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReportById } = useData();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundReport = getReportById(id);
    if (foundReport) {
      setReport(foundReport);
    }
    setLoading(false);
  }, [id, getReportById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Reporte no encontrado</h2>
        <button
          onClick={() => navigate('/ciudadano/mis-reportes')}
          className="text-primary-600 hover:underline"
        >
          Volver a Mis Reportes
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const statusTimeline = [
    { status: 'pendiente', label: 'Recibido', icon: AlertCircle },
    { status: 'en-proceso', label: 'En Proceso', icon: Clock },
    { status: 'resuelto', label: 'Resuelto', icon: CheckCircle }
  ];

  const currentStatusIndex = statusTimeline.findIndex(t => t.status === report.status);

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Reporte</h1>
          <p className="text-gray-600 text-sm">ID: {report.id}</p>
        </div>
      </div>

      {/* Estado y prioridad */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getTypeIcon(report.type)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{report.typeName}</h2>
              <p className="text-gray-600 text-sm capitalize">Categoría: {report.category}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={report.status} size="lg" />
            <PriorityBadge priority={report.priority} size="lg" />
          </div>
        </div>

        {/* Timeline de estados */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {statusTimeline.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? isCurrent
                            ? 'bg-primary-600 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < statusTimeline.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Información del reporte */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Descripción */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
          <p className="text-gray-700">{report.description}</p>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Ubicación</h3>
          <div className="flex items-start gap-2 text-gray-700 mb-3">
            <MapPin size={18} className="flex-shrink-0 mt-0.5" />
            <span>{report.address}</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Coordenadas: {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}</p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ubicación en el mapa</h3>
        <MapComponent
          center={report.location}
          marker={report.location}
          height="300px"
          readOnly={true}
        />
      </div>

      {/* Fotos del reporte */}
      {report.photos && report.photos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image size={20} />
            Fotos del reporte
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {report.photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                {/* En producción, aquí iría la URL real de la foto */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fotos de resolución (si está resuelto) */}
      {report.resolutionPhotos && report.resolutionPhotos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Evidencia de resolución
          </h3>
          {report.resolutionNotes && (
            <p className="text-gray-700 mb-4">{report.resolutionNotes}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {report.resolutionPhotos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fechas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Historial</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-600">Creado:</span>
            <span className="text-gray-900">{formatDate(report.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-gray-400" />
            <span className="text-gray-600">Última actualización:</span>
            <span className="text-gray-900">{formatDate(report.updatedAt)}</span>
          </div>
          {report.resolvedAt && (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-gray-600">Resuelto:</span>
              <span className="text-green-700">{formatDate(report.resolvedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CiudadanoReportDetail;
