import { AlertOctagon, Flame, AlertTriangle, ArrowDown } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  const configs = {
    Critical: {
      bg: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Flame,
      label: 'Critical'
    },
    High: {
      bg: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertOctagon,
      label: 'High'
    },
    Medium: {
      bg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      label: 'Medium'
    },
    Low: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: ArrowDown,
      label: 'Low'
    }
  };

  const config = configs[priority] || configs['Medium'];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}
