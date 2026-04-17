import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MunicipalidadAnalytics = () => {
  const { getAllReports, getStats } = useData();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  useEffect(() => {
    const allReports = getAllReports();
    setReports(allReports);
    setStats(getStats());
  }, [getAllReports, getStats]);

  // Filtrar reportes por fecha
  const filteredReports = reports.filter(report => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

    const reportDate = new Date(report.createdAt);
    const inDateRange = reportDate >= daysAgo;

    const inCategory = categoryFilter === 'todos' || report.category === categoryFilter;

    return inDateRange && inCategory;
  });

  // Datos para gráficos
  const categoryData = Object.entries(stats?.byCategory || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  const statusData = [
    { name: 'Pendientes', value: stats?.pendientes || 0 },
    { name: 'En Proceso', value: stats?.enProceso || 0 },
    { name: 'Resueltos', value: stats?.resueltos || 0 },
    { name: 'Rechazados', value: stats?.duplicados || 0 }
  ];

  // Reportes por día (últimos 7 días)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => {
    const dayReports = reports.filter(r => r.createdAt.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
      reportes: dayReports.length,
      resueltos: dayReports.filter(r => r.status === 'resuelto').length
    };
  });

  // Prioridad distribución
  const priorityData = [
    { name: 'Crítica', value: reports.filter(r => r.priority === 'critica').length },
    { name: 'Alta', value: reports.filter(r => r.priority === 'alta').length },
    { name: 'Media', value: reports.filter(r => r.priority === 'media').length },
    { name: 'Baja', value: reports.filter(r => r.priority === 'baja').length }
  ];

  // Exportar a PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte Analítico - LimpiaTuCiudad', 14, 20);

    // Fecha
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 14, 30);

    // Estadísticas
    doc.setFontSize(12);
    doc.text('Estadísticas Generales', 14, 45);

    const statsTable = [
      ['Total Reportes', stats?.total || 0],
      ['Pendientes', stats?.pendientes || 0],
      ['En Proceso', stats?.enProceso || 0],
      ['Resueltos', stats?.resueltos || 0],
      ['Tiempo Promedio Resolución', `${stats?.avgResolutionTime || 0} días`]
    ];

    doc.autoTable({
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: statsTable,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] }
    });

    // Reportes detallados
    doc.setFontSize(12);
    doc.text('Detalle de Reportes', 14, doc.lastAutoTable.finalY + 20);

    const reportTable = reports.map(r => [
      r.id,
      r.typeName,
      r.status,
      r.priority,
      new Date(r.createdAt).toLocaleDateString('es-AR')
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['ID', 'Tipo', 'Estado', 'Prioridad', 'Fecha']],
      body: reportTable,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 8 }
    });

    doc.save(`reporte-limpia-tu-ciudad-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Exportar a Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reports.map(r => ({
        ID: r.id,
        Tipo: r.typeName,
        Categoría: r.category,
        Descripción: r.description,
        Dirección: r.address,
        Estado: r.status,
        Prioridad: r.priority,
        'Fecha Creación': r.createdAt,
        'Fecha Resolución': r.resolvedAt || ''
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');

    XLSX.writeFile(workbook, `reporte-limpia-tu-ciudad-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const categories = [...new Set(reports.map(r => r.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Analíticas y Reportes</h1>
          <p className="text-gray-600">Dashboard con métricas y KPIs del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <Download size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todas</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{filteredReports.length}</p>
          <p className="text-xs text-gray-500 mt-1">en el período seleccionado</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Tasa Resolución</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats?.total > 0 ? Math.round((stats.resueltos / stats.total) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats?.resueltos} reportes resueltos</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Tiempo Promedio</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.avgResolutionTime || 0}</p>
          <p className="text-xs text-gray-500 mt-1">días para resolver</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <span className="text-gray-600 text-sm">Eficiencia</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.enProceso > 0
              ? Math.round((stats.resueltos / (stats.resueltos + stats.enProceso)) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">de efectividad</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reportes por categoría */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Reportes por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de reportes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Estado de Reportes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolución diaria */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Evolución Diaria (Últimos 7 días)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reportes" stroke="#0ea5e9" name="Reportes" />
              <Line type="monotone" dataKey="resueltos" stroke="#22c55e" name="Resueltos" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Prioridad */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Distribución por Prioridad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mapa de calor (simplificado) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Concentración de Reportes por Zona
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {['Norte', 'Sur', 'Centro'].map(zone => {
            const zoneReports = reports.filter(r =>
              r.address.toLowerCase().includes(zone.toLowerCase()) ||
              (zone === 'Centro' && !r.address.toLowerCase().includes('norte') && !r.address.toLowerCase().includes('sur'))
            );
            const percentage = reports.length > 0 ? (zoneReports.length / reports.length) * 100 : 0;

            return (
              <div
                key={zone}
                className={`p-4 rounded-lg border-2 text-center ${
                  percentage > 50
                    ? 'border-red-300 bg-red-50'
                    : percentage > 25
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-green-300 bg-green-50'
                }`}
              >
                <p className="font-semibold text-gray-900">Zona {zone}</p>
                <p className="text-2xl font-bold mt-2">{zoneReports.length}</p>
                <p className="text-sm text-gray-600">reportes</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      percentage > 50
                        ? 'bg-red-500'
                        : percentage > 25
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MunicipalidadAnalytics;
