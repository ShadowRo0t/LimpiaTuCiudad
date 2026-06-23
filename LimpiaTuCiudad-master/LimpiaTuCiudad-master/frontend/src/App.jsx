import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CiudadanoDashboard from './pages/ciudadano/Dashboard';
import CiudadanoNewReport from './pages/ciudadano/NewReport';
import CiudadanoMyReports from './pages/ciudadano/MyReports';
import CiudadanoReportDetail from './pages/ciudadano/ReportDetail';
import MunicipalidadDashboard from './pages/municipalidad/Dashboard';
import MunicipalidadReports from './pages/municipalidad/Reports';
import MunicipalidadAssignments from './pages/municipalidad/Assignments';
import MunicipalidadAnalytics from './pages/municipalidad/Analytics';
import CuadrillaDashboard from './pages/cuadrilla/Dashboard';
import CuadrillaTasks from './pages/cuadrilla/Tasks';
import CuadrillaTaskDetail from './pages/cuadrilla/TaskDetail';
import CuadrillaRouteMap from './pages/cuadrilla/RouteMap';
import NotFound from './pages/NotFound';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Página de redirección según rol
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'ciudadano':
      return <Navigate to="/ciudadano" replace />;
    case 'municipalidad':
      return <Navigate to="/municipalidad" replace />;
    case 'cuadrilla':
      return <Navigate to="/cuadrilla" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas - Ciudadano */}
      <Route
        path="/ciudadano/*"
        element={
          <ProtectedRoute allowedRoles={['ciudadano']}>
            <Layout>
              <Routes>
                <Route path="" element={<CiudadanoDashboard />} />
                <Route path="nuevo" element={<CiudadanoNewReport />} />
                <Route path="mis-reportes" element={<CiudadanoMyReports />} />
                <Route path="reporte/:id" element={<CiudadanoReportDetail />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Municipalidad */}
      <Route
        path="/municipalidad/*"
        element={
          <ProtectedRoute allowedRoles={['municipalidad']}>
            <Layout>
              <Routes>
                <Route path="" element={<MunicipalidadDashboard />} />
                <Route path="reportes" element={<MunicipalidadReports />} />
                <Route path="asignaciones" element={<MunicipalidadAssignments />} />
                <Route path="analiticas" element={<MunicipalidadAnalytics />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Cuadrilla */}
      <Route
        path="/cuadrilla/*"
        element={
          <ProtectedRoute allowedRoles={['cuadrilla']}>
            <Layout>
              <Routes>
                <Route path="" element={<CuadrillaDashboard />} />
                <Route path="tareas" element={<CuadrillaTasks />} />
                <Route path="tarea/:id" element={<CuadrillaTaskDetail />} />
                <Route path="mapa" element={<CuadrillaRouteMap />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de redirección */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
