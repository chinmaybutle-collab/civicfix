export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-5 bg-slate-200 rounded w-24" />
            <div className="h-5 bg-slate-200 rounded-full w-20" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-8 bg-slate-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
        <div className="h-5 bg-slate-200 rounded w-28" />
        <div className="h-5 bg-slate-200 rounded w-36" />
        <div className="h-5 bg-slate-200 rounded w-44" />
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-3 px-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-40" />
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-8 bg-slate-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 h-64 bg-slate-100" />
          <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-4/5" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 h-48 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
