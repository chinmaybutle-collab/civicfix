import { CheckCircle, Circle, Clock, Wrench, ShieldCheck, UserCheck } from 'lucide-react';

const STAGES = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

export default function Timeline({ timeline = [], currentStatus = 'Reported' }) {
  const currentIndex = STAGES.indexOf(currentStatus);
  const isRejected = currentStatus === 'Rejected';

  return (
    <div className="space-y-6">
      {/* Horizontal step progress bar */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="hidden sm:block absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: isRejected ? '100%' : `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%`,
            backgroundColor: isRejected ? '#EF4444' : '#2563EB'
          }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = !isRejected && currentIndex >= idx;
            const isCurrent = !isRejected && currentStatus === stage;

            return (
              <div key={stage} className="flex sm:flex-col items-center gap-2 sm:text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : isCurrent
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200 animate-pulse'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="text-left sm:text-center">
                  <div className={`text-xs font-semibold ${isCompleted ? 'text-blue-900 font-bold' : 'text-slate-500'}`}>
                    {stage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Log List */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Audit Trail & Verification Updates
        </h4>

        <div className="space-y-4">
          {timeline.map((item, index) => {
            const isLast = index === timeline.length - 1;
            const formattedDate = new Date(item.date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={index} className="flex gap-4 items-start relative">
                {!isLast && (
                  <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200 -z-0" />
                )}
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 z-10 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900">{item.status}</span>
                    <span className="text-slate-400 font-mono">{formattedDate}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
