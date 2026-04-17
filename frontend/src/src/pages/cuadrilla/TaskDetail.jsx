import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import MapComponent from '../../components/MapComponent';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CuadrillaTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getReportById, resolveReport, createNotification } = useData();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const foundReport = getReportById(id);
    if (foundReport) {
      setReport(foundReport);
    }
    setLoading(false);
  }, [id, getReportById]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError('Máximo 5 fotos de evidencia');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          file,
          preview: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    setError('');
    setCompleting(true);

    // Validaciones
    if (photos.length === 0) {
      setError('Debes subir al menos una foto de evidencia');
      setCompleting(false);
      return;
    }

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Marcar como resuelto
    resolveReport(report.id, {
      resolutionPhotos: photos.map(p => p.name),
      resolutionNotes: notes || 'Trabajo completado'
    });

    // Crear notificación para el ciudadano
    createNotification({
      userId: report.userId,
      reportId: report.id,
      type: 'resolved',
      title: 'Tu reporte ha sido resuelto',
      message: `El reporte "${report.typeName}" ha sido solucionado exitosamente por ${user.name}.`,
      read: false
    });

    setCompleting(false);
    setSuccess('¡Tarea completada exitosamente!');

    setTimeout(() => {
      navigate('/cuadrilla/tareas');
    }, 1500);
  };

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tarea no encontrada</h2>
        <button
          onClick={() => navigate('/cuadrilla/tareas')}
          className="text-primary-600 hover:underline"
        >
          Volver a Mis Tareas
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

  const isCompleted = report.status === 'resuelto';

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
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Tarea</h1>
          <p className="text-gray-600 text-sm">ID: {report.id}</p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Info principal */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getTypeIcon(report.type)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{report.typeName}</h2>
              <p className="text-gray-600 text-sm capitalize">Categoría: {report.category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={report.status} size="md" />
            <PriorityBadge priority={report.priority} size="md" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700">{report.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} />
              <span>{report.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ubicación en el mapa</h3>
        <MapComponent
          center={report.location}
          marker={report.location}
          height="250px"
          readOnly={true}
        />
      </div>

      {/* Fotos originales del reporte */}
      {report.photos && report.photos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera size={20} />
            Fotos del reporte original
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {report.photos.map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de completado */}
      {!isCompleted ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Completar Tarea
          </h3>

          <div className="space-y-4">
            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de finalización (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe el trabajo realizado, materiales usados, etc."
              />
            </div>

            {/* Fotos de evidencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos de evidencia *
              </label>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={photo.preview}
                        alt={`Evidencia ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors"
              >
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-gray-600 text-sm">
                  {photos.length === 0
                    ? 'Toca para agregar fotos de evidencia'
                    : `Agregar más fotos (${photos.length}/5)`}
                </p>
              </button>
            </div>

            {/* Botón de completar */}
            <button
              onClick={handleComplete}
              disabled={completing || photos.length === 0}
              className="w-full py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              <span>{completing ? 'Completando...' : 'Marcar como Completado'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Tarea Completada</h3>
              <p className="text-sm text-green-700">
                {report.resolvedAt && `El ${formatDate(report.resolvedAt)}`}
              </p>
            </div>
          </div>

          {report.resolutionNotes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-green-900 mb-1">Notas:</p>
              <p className="text-green-700">{report.resolutionNotes}</p>
            </div>
          )}

          {report.resolutionPhotos && report.resolutionPhotos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-900 mb-2">Fotos de evidencia:</p>
              <div className="grid grid-cols-3 gap-2">
                {report.resolutionPhotos.map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-green-200 bg-green-100"
                  >
                    <div className="w-full h-full flex items-center justify-center text-green-400">
                      <Camera size={24} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Información</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-600">Creado:</span>
            <span className="text-gray-900">{formatDate(report.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-gray-600">Asignado a:</span>
            <span className="text-gray-900">{user.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuadrillaTaskDetail;
