import { clsx } from 'clsx';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    'pendiente': {
      label: 'Pendiente',
      className: 'status-pendiente'
    },
    'en-proceso': {
      label: 'En Proceso',
      className: 'status-en-proceso'
    },
    'resuelto': {
      label: 'Resuelto',
      className: 'status-resuelto'
    },
    'rechazado': {
      label: 'Rechazado',
      className: 'status-rechazado'
    }
  };

  const config = statusConfig[status] || statusConfig['pendiente'];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        config.className,
        sizeClasses[size]
      )}
    >
      {status === 'pendiente' && (
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
      )}
      {status === 'en-proceso' && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
      )}
      {status === 'resuelto' && (
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
      )}
      {status === 'rechazado' && (
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;
