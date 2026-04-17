import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ReportCard = ({ report, baseUrl = '/ciudadano/reporte' }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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

  return (
    <Link
      to={`${baseUrl}/${report.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getTypeIcon(report.type)}</span>
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {report.typeName}
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {report.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                {report.address.split(',')[0]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(report.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={report.status} size="sm" />
          <PriorityBadge priority={report.priority} size="sm" />
          <ChevronRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={20} />
        </div>
      </div>
    </Link>
  );
};

export default ReportCard;
