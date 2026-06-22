import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  Home,
  PlusCircle,
  FileText,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Building,
  Truck,
  BarChart3,
  ClipboardList,
  MapPin
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isCiudadano, isMunicipalidad, isCuadrilla } = useAuth();
  const { unreadNotifications } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menú según rol
  const getMenuItems = () => {
    if (isCiudadano) {
      return [
        { path: '/ciudadano', label: 'Inicio', icon: Home },
        { path: '/ciudadano/nuevo', label: 'Nuevo Reporte', icon: PlusCircle },
        { path: '/ciudadano/mis-reportes', label: 'Mis Reportes', icon: FileText }
      ];
    }

    if (isMunicipalidad) {
      return [
        { path: '/municipalidad', label: 'Dashboard', icon: Home },
        { path: '/municipalidad/reportes', label: 'Reportes', icon: FileText },
        { path: '/municipalidad/asignaciones', label: 'Asignaciones', icon: ClipboardList },
        { path: '/municipalidad/analiticas', label: 'Analíticas', icon: BarChart3 }
      ];
    }

    if (isCuadrilla) {
      return [
        { path: '/cuadrilla', label: 'Inicio', icon: Home },
        { path: '/cuadrilla/tareas', label: 'Mis Tareas', icon: ClipboardList },
        { path: '/cuadrilla/mapa', label: 'Mapa y Rutas', icon: MapPin }
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();
  const unreadCount = unreadNotifications.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y menú móvil */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link to="/" className="flex items-center space-x-2 ml-2 lg:ml-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <MapPin className="text-white" size={20} />
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">LimpiaTuCiudad</span>
              </Link>
            </div>

            {/* Navegação desktop */}
            <nav className="hidden lg:flex space-x-8">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Dereita: Notificações e Perfil */}
            <div className="flex items-center space-x-4">
              {/* Notificações */}
              {isCiudadano && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de notificações */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {unreadNotifications.length === 0 ? (
                          <p className="p-4 text-gray-500 text-center">No hay notificaciones</p>
                        ) : (
                          unreadNotifications.map(notif => (
                            <div
                              key={notif.id}
                              className="p-4 border-b border-gray-100 hover:bg-gray-50"
                            >
                              <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                              <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                              <p className="text-gray-400 text-xs mt-2">
                                {new Date(notif.createdAt).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Perfil */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  {isCiudadano && <User className="text-primary-600" size={20} />}
                  {isMunicipalidad && <Building className="text-primary-600" size={20} />}
                  {isCuadrilla && <Truck className="text-primary-600" size={20} />}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
