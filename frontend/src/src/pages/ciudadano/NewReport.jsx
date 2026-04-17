import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { incidentTypes, checkDuplicate, calculatePriority } from '../../data/mockData';
import MapComponent from '../../components/MapComponent';
import {
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Navigation,
  Info
} from 'lucide-react';

const CiudadanoNewReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReport, getAllReports, createNotification } = useData();

  const [formData, setFormData] = useState({
    type: '',
    description: '',
    address: ''
  });

  const [location, setLocation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef(null);

  // Obtener ubicación GPS
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setGettingLocation(false);

        // Reverse geocoding simulado
        setFormData(prev => ({
          ...prev,
          address: `Ubicación GPS (${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)})`
        }));
      },
      (err) => {
        console.error('Error GPS:', err);
        setGettingLocation(false);
        setError('No se pudo obtener la ubicación. Por favor, selecciona manualmente en el mapa.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Manejar selección de foto
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError('Máximo 5 fotos por reporte');
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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar foto
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Validar duplicados
  useEffect(() => {
    if (formData.type && location) {
      const allReports = getAllReports();
      const isDuplicate = checkDuplicate(allReports, {
        type: formData.type,
        location
      });

      if (isDuplicate) {
        setDuplicateWarning(
          'Ya existe un reporte similar en esta ubicación. ¿Estás seguro de que quieres crear un nuevo reporte?'
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [formData.type, location, getAllReports]);

  // Manejar cambio en formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Enviar reporte
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.type) {
      setError('Selecciona un tipo de incidente');
      return;
    }
    if (!formData.description.trim()) {
      setError('Describe el incidente');
      return;
    }
    if (!formData.address.trim()) {
      setError('Ingresa una dirección o ubicación');
      return;
    }
    if (!location) {
      setError('Selecciona una ubicación en el mapa');
      return;
    }

    setLoading(true);

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedType = incidentTypes.find(t => t.id === formData.type);
    const priority = calculatePriority(formData.type, formData.description);

    // Crear reporte
    const newReport = createReport({
      userId: user.id,
      type: formData.type,
      typeName: selectedType?.name || formData.type,
      category: selectedType?.category || 'otros',
      description: formData.description,
      address: formData.address,
      location,
      photos: photos.map(p => p.name),
      priority
    });

    // Crear notificación
    createNotification({
      userId: user.id,
      reportId: newReport.id,
      type: 'created',
      title: 'Reporte creado exitosamente',
      message: `Tu reporte "${newReport.typeName}" ha sido registrado.`,
      read: false
    });

    setLoading(false);
    setSuccess('¡Reporte creado exitosamente!');

    // Redirigir después de un momento
    setTimeout(() => {
      navigate(`/ciudadano/reporte/${newReport.id}`);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nuevo Reporte</h1>
        <p className="text-gray-600">
          Completa el formulario para reportar un problema urbano
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {duplicateWarning && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-yellow-700 text-sm">{duplicateWarning}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de incidente */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Tipo de Incidente *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {incidentTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  formData.type === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">
                  {type.id === 'bache' && '🛣️'}
                  {type.id === 'luminaria' && '💡'}
                  {type.id === 'basura' && '🗑️'}
                  {type.id === 'arbol' && '🌳'}
                  {type.id === 'alcantarilla' && '🕳️'}
                  {type.id === 'vereda' && '🚶'}
                  {type.id === 'senalizacion' && '🚦'}
                  {type.id === 'plaga' && '🐛'}
                  {type.id === 'agua' && '💧'}
                  {type.id === 'otro' && '📋'}
                </span>
                <span className="text-xs font-medium text-gray-700">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Describe el problema con detalle. Incluye información sobre cuándo lo viste, si representa peligro, etc."
            required
          />
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Ubicación *
          </label>

          {/* Botones de ubicación */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Navigation size={18} />
              <span>{gettingLocation ? 'Obteniendo...' : 'Usar mi ubicación'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MapPin size={18} />
              <span>{showMap ? 'Ocultar mapa' : 'Seleccionar en mapa'}</span>
            </button>
          </div>

          {/* Mapa */}
          {showMap && (
            <div className="mb-4">
              <MapComponent
                center={location || { lat: -34.6037, lng: -58.3816 }}
                marker={location}
                onLocationSelect={setLocation}
                height="300px"
              />
            </div>
          )}

          {/* Dirección */}
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Dirección o referencia"
            required
          />

          {location && (
            <p className="mt-2 text-sm text-gray-600">
              Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Fotos (opcional, máximo 5)
          </label>

          {/* Vista previa de fotos */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photo.preview}
                    alt={`Foto ${index + 1}`}
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

          {/* Input de archivo */}
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
                ? 'Toca para agregar fotos'
                : `Agregar más fotos (${photos.length}/5)`}
            </p>
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/ciudadano')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando reporte...' : 'Enviar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CiudadanoNewReport;
