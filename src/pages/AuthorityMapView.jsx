import { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { ISSUE_CATEGORIES, WARDS } from '../services/mockData';
import LeafletMap from '../components/LeafletMap';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  Map as MapIcon, 
  Filter, 
  Layers, 
  Search, 
  Eye, 
  Flame, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthorityMapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        ward: wardFilter
      });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load map complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, wardFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <span>GIS Municipal Spatial Map</span>
            <span>·</span>
            <span>Live City Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Geographic Issue Map &amp; Cluster Overview
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time geospatial distribution of active civic infrastructure complaints
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Reported</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-rose-600 font-bold">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span>Critical P0</span>
          </div>
        </div>
      </div>

      {/* Filter strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter Pins:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="All">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="All">All Wards</option>
            {WARDS.map((w) => (
              <option key={w} value={w}>{w.split(' - ')[0]}</option>
            ))}
          </select>
        </div>

        <div className="font-mono text-slate-500 font-bold text-xs">
          Showing <span className="text-blue-600">{complaints.length}</span> pinned tickets
        </div>
      </div>

      {/* Main Full-Size Map Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-md overflow-hidden relative">
        <LeafletMap
          mode="multi"
          complaints={complaints}
          height="620px"
          defaultCenter={[28.6139, 77.2090]}
          defaultZoom={13}
        />
      </div>

    </div>
  );
}
