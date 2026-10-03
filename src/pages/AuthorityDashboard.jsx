import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { CardSkeleton } from '../components/SkeletonLoader';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ArrowUpRight, 
  FileText, 
  ShieldAlert, 
  Activity, 
  TrendingUp,
  Map,
  Filter,
  Flame
} from 'lucide-react';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [criticalList, setCriticalList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [stats, allComplaints] = await Promise.all([
          complaintService.getAnalytics(),
          complaintService.getComplaints()
        ]);
        setAnalytics(stats);
        // Extract urgent issues
        const urgent = allComplaints.filter(
          (c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Resolved'
        );
        setCriticalList(urgent.slice(0, 5));
      } catch (err) {
        console.error('Failed to load authority analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Authority Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase tracking-wider font-mono text-indigo-300 font-bold">
              Central Municipal Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Municipal Operations &amp; Grievance Redressal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Officer in charge: <strong className="text-white">{user?.name}</strong> · Live Ward Monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/authority/map"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            <Map className="w-4 h-4" />
            <span>Open City Map</span>
          </Link>
          <Link
            to="/authority/complaints"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Triage Complaints</span>
          </Link>
        </div>
      </div>

      {/* AI Operations Briefing Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/80 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Gemini AI Executive Dispatch Briefing</span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                Active Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              <strong>Actionable Summary: </strong> Priority bottlenecks detected in <strong className="text-slate-900">Ward 2 (Water Main Pipe Burst)</strong> and <strong className="text-slate-900">Ward 4 (Ring Road Pothole)</strong>. Dispatched response teams have contained 60% of critical hazards. Overall city SLA resolution is tracking at <strong>{analytics.resolutionRate}%</strong> with a mean turnaround of <strong>{analytics.avgResolutionHours} hours</strong>.
            </p>
          </div>
        </div>

        <Link
          to="/authority/complaints?priority=Critical"
          className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl whitespace-nowrap transition-colors shadow-2xs self-end md:self-auto"
        >
          Inspect Critical Queue
        </Link>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Filed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</span>
            <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{analytics.total}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">City-wide cumulative</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Triage Queue</span>
            <h3 className="text-3xl font-extrabold text-amber-700 font-mono mt-1">
              {analytics.reported + analytics.verified}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Needs dispatching</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Active Crews</span>
            <h3 className="text-3xl font-extrabold text-purple-700 font-mono mt-1">
              {analytics.inProgress}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">On-site repair</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* SLA Resolution Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">SLA Performance</span>
            <h3 className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">
              {analytics.resolutionRate}%
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Avg {analytics.avgResolutionHours}h turnaround
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Complaints by Civic Category</h3>
              <p className="text-xs text-slate-400">Frequency of reports by municipal department sector</p>
            </div>
            <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Resolution Pipeline Status</h3>
              <p className="text-xs text-slate-400">Distribution across active workflow stages</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
              Donut
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Second Row: 7-Day Resolution Inflow vs Outflow Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Trend Area Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Intake vs Resolution Velocity</h3>
              <p className="text-xs text-slate-400">Comparing 7-day reported grievances vs completed repairs</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Trend
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="reported" stroke="#3B82F6" fillOpacity={1} fill="url(#colorReported)" name="New Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorResolved)" name="Completed Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward-wise Efficiency (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ward-wise Grievance Volume</h3>
              <p className="text-xs text-slate-400">Total vs pending complaint counts by geographical ward</p>
            </div>
            <span className="text-xs font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
              Wards
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.wardData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ward" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="resolved" stackId="a" fill="#10B981" name="Resolved" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending Action" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Critical Attention Issues Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Urgent &amp; Critical Priority Escalations
              </h3>
              <p className="text-xs text-slate-400">
                Issues flagged as immediate safety hazards requiring priority crew dispatch
              </p>
            </div>
          </div>

          <Link
            to="/authority/complaints?priority=Critical"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All Escalations</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Hazard Category</th>
                <th className="py-2.5 px-3">Location Details</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {criticalList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {item.id}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 max-w-[260px] truncate text-slate-600">
                    📍 {item.location?.address}
                  </td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/complaints/${item.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
