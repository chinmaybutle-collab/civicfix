import { Inbox, PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No complaints found',
  description = 'There are no civic grievances matching your current criteria.',
  icon: Icon = Inbox,
  actionLabel = 'Report New Issue',
  actionLink = '/report',
  onActionClick
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto my-8">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Link>
      )}

      {onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow"
        >
          <Search className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
