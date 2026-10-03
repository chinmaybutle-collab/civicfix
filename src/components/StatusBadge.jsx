import { CheckCircle2, Clock, AlertCircle, UserCheck, Wrench, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    Reported: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: Clock,
      label: 'Reported'
    },
    Verified: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-500',
      icon: AlertCircle,
      label: 'Verified'
    },
    Assigned: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500',
      icon: UserCheck,
      label: 'Assigned'
    },
    'In Progress': {
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      dot: 'bg-purple-500',
      icon: Wrench,
      label: 'In Progress'
    },
    Resolved: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Resolved'
    },
    Rejected: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const config = configs[status] || configs['Reported'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.bg} ${sizeClasses[size] || sizeClasses.md} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 animate-pulse`} />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
