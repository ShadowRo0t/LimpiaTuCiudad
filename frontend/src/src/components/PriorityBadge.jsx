import { clsx } from 'clsx';

const PriorityBadge = ({ priority, size = 'md' }) => {
  const priorityConfig = {
    'baja': {
      label: 'Baja',
      className: 'priority-baja'
    },
    'media': {
      label: 'Media',
      className: 'priority-media'
    },
    'alta': {
      label: 'Alta',
      className: 'priority-alta'
    },
    'critica': {
      label: 'Crítica',
      className: 'priority-critica'
    }
  };

  const config = priorityConfig[priority] || priorityConfig['media'];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        config.className,
        sizeClasses[size]
      )}
    >
      {priority === 'critica' && '🔴'}
      {priority === 'alta' && '🟠'}
      {priority === 'media' && '🟡'}
      {priority === 'baja' && '⚪'}
      <span className="ml-1">{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
