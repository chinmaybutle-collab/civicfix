import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { 
  PlusCircle, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  FileText, 
  ArrowUpRight, 
  Eye, 
  MapPin, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load complaints', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute citizen metrics
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Reported' || c.status === 'Verified' || c.status === 'Assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome & Main Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Citizen'}
            </h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              Citizen Portal
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            {user?.ward || 'Ward 4 - Metro Station Corridor'} · {user?.city || 'Metro City'}
          </p>
        </div>

        <div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Complaints</p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{total}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Lifetime filed by city</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-mono mt-1">{pending}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting / assigned</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">In Progress</p>
            <h3 className="text-3xl font-extrabold text-purple-700 font-mono mt-1">{inProgress}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Active on ground</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
            <h3 className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">{resolved}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              {total > 0 ? `${Math.round((resolved / total) * 100)}% resolution rate` : '0%'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Civic Grievances
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track real-time progress and verification stages for your locality
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
            </div>

            <Link
              to="/complaints"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading && (viewMode === 'cards' ? <CardSkeleton count={3} /> : <TableSkeleton rows={4} />)}

        {/* Empty state */}
        {!loading && complaints.length === 0 && (
          <EmptyState
            title="No complaints filed yet"
            description="You haven't reported any civic problems. Spot a broken streetlight, pothole or garbage pile? Report it now!"
            actionLabel="Report Your First Issue"
            actionLink="/report"
          />
        )}

        {/* Content: Cards View */}
        {!loading && complaints.length > 0 && viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: ID and Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  {/* Title & Category */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Meta details & Action */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location?.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(item.reportedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    to={`/complaints/${item.id}`}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Details &amp; Audit Trail</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content: Table View */}
        {!loading && complaints.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Reported Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-600">
                        {item.location?.address}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(item.reportedDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/complaints/${item.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <span>View</span>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
