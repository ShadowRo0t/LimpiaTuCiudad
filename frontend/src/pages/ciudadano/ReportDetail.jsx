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
  const [showBoxes, setShowBoxes] = useState(true);

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

      {/* Panel de Análisis de Inteligencia Artificial (OWL-ViT) */}
      {report.aiAnalysis && report.aiAnalysis.performed && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 font-mono text-sm">
                AI
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100 font-mono tracking-tight">ANÁLISIS DE IMAGEN (OWL-ViT)</h3>
                <p className="text-xs text-slate-400 font-mono">Zero-Shot Object Detection Pipeline</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                showBoxes 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {showBoxes ? '[X] OCULTAR Bounding Boxes' : '[ ] VER Bounding Boxes'}
            </button>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {/* Visualización de la Imagen con Bounding Boxes */}
            <div className="md:col-span-3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
                <img
                  src={report.photos[0] && (report.photos[0].startsWith('data:') || report.photos[0].startsWith('blob:'))
                    ? report.photos[0] 
                    : 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80'}
                  alt="Detección OWL-ViT"
                  className="w-full h-full object-cover opacity-90 transition-all group-hover:opacity-100"
                />
                
                {/* Cuadros delimitadores */}
                {showBoxes && report.aiAnalysis.objects && (
                  <div className="absolute inset-0 pointer-events-none">
                    {report.aiAnalysis.objects.map((obj, i) => {
                      const [ymin, xmin, ymax, xmax] = obj.box;
                      
                      let borderClass = 'border-emerald-400 text-emerald-400 bg-slate-950/80';
                      if (obj.label.includes('cable') || obj.label.includes('eléctrico')) {
                        borderClass = 'border-red-500 text-red-400 bg-red-950/85';
                      } else if (obj.label.includes('vehículo') || obj.label.includes('auto') || obj.label.includes('propiedad')) {
                        borderClass = 'border-yellow-500 text-yellow-400 bg-yellow-950/85';
                      } else if (obj.label.includes('calle') || obj.label.includes('vereda')) {
                        borderClass = 'border-sky-400 text-sky-400 bg-sky-950/85';
                      }
                      
                      return (
                        <div
                          key={i}
                          className={`absolute border-2 rounded ${borderClass} pointer-events-auto transition-all hover:scale-[1.01] hover:border-white shadow-md`}
                          style={{
                            top: `${ymin}%`,
                            left: `${xmin}%`,
                            width: `${xmax - xmin}%`,
                            height: `${ymax - ymin}%`
                          }}
                        >
                          <span className="absolute -top-6 left-0 px-2 py-0.5 text-[9px] font-mono font-bold rounded shadow-md border border-inherit">
                            {obj.label} ({Math.round(obj.confidence * 100)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Detalles de la Clasificación */}
            <div className="md:col-span-2 space-y-4">
              {/* Tarjeta de Nivel de Peligro */}
              <div className={`p-4 rounded-xl border ${
                report.aiAnalysis.dangerLevel === 'critica' ? 'bg-purple-950/40 border-purple-500/30 text-purple-200 animate-pulse' :
                report.aiAnalysis.dangerLevel === 'alta' ? 'bg-red-950/40 border-red-500/30 text-red-200' :
                report.aiAnalysis.dangerLevel === 'media' ? 'bg-orange-950/40 border-orange-500/30 text-orange-200' :
                'bg-slate-800/40 border-slate-700 text-slate-200'
              }`}>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Nivel de Riesgo IA</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold tracking-tight capitalize">{report.aiAnalysis.dangerLevel}</span>
                  <span className="text-xs text-slate-400">({Math.round(report.aiAnalysis.confidence * 100)}% conf)</span>
                </div>
              </div>
              
              {/* Tabla de Parámetros Detectados */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Parámetros Críticos</p>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Tamaño del árbol:
                  </span>
                  <span className="font-mono font-bold capitalize text-slate-200">{report.aiAnalysis.treeSize}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    Obstrucción:
                  </span>
                  <span className="font-mono font-bold capitalize text-slate-200">{report.aiAnalysis.obstruction.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Daño colateral:
                  </span>
                  <span className="font-mono font-bold capitalize text-slate-200">{report.aiAnalysis.damage.replace('_', ' ')}</span>
                </div>
              </div>
              
              {/* Confianza de Detección */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Métricas de Detección</p>
                <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1">
                  {report.aiAnalysis.objects.map((obj, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 capitalize">{obj.label}</span>
                        <span className="text-slate-400">{Math.round(obj.confidence * 100)}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${obj.confidence * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Explicación Técnica de Peligro */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">Justificación Técnica del Modelo</p>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {report.aiAnalysis.reason}
            </p>
          </div>
        </div>
      )}

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
                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative group"
              >
                {photo.startsWith('data:') || photo.startsWith('blob:') ? (
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5 p-3">
                    <img 
                      src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=400&q=80" 
                      alt="Árbol Caído Mock" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white font-mono text-xs">
                      [Foto adjunta]
                    </div>
                  </div>
                )}
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
