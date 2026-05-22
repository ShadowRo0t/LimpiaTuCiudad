import { Link } from 'react-router-dom';
import { MapPin, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MapPin className="text-primary-600" size={48} />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-primary-100 mb-8">Página no encontrada</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
        >
          <Home size={20} />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
