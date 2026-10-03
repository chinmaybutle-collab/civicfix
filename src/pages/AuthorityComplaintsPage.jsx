import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { aiService } from '../services/aiService';
import { ISSUE_CATEGORIES, DEPARTMENTS, WARDS } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { 
  Search, 
  Filter, 
  Building2, 
  UserCheck, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Send,
  X,
  Sparkles,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

export default function AuthorityComplaintsPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');

  // Modal state for assigning/updating
  const [activeItem, setActiveItem] = useState(null);
  const [editStatus, setEditStatus] = useState('In Progress');
  const [editDept, setEditDept] = useState(DEPARTMENTS[0]);
  const [editOfficer, setEditOfficer] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // AI Triage & Draft state
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [aiTriageData, setAiTriageData] = useState(null);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        department: departmentFilter,
        ward: wardFilter
      });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints for authority', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [searchQuery, statusFilter, categoryFilter, priorityFilter, departmentFilter, wardFilter]);

  const openActionModal = (item) => {
    setActiveItem(item);
    setEditStatus(item.status);
    setEditDept(item.department !== 'Pending Department Assignment' ? item.department : DEPARTMENTS[0]);
    setEditOfficer(item.assignedOfficer || '');
    setEditNote('');
    setAiTriageData(null);
  };

  const handleFetchAITriage = async () => {
    if (!activeItem) return;
    setAiTriageLoading(true);
    try {
      const result = await aiService.triageComplaint(activeItem);
      setAiTriageData(result);
      if (result.officerDispatchRemarks) {
        setEditNote(result.officerDispatchRemarks);
      }
    } catch (err) {
      console.error('Failed to get AI triage', err);
    } finally {
      setAiTriageLoading(false);
    }
  };

  const handleDraftCitizenResponse = async () => {
    if (!activeItem) return;
    setAiDraftLoading(true);
    try {
      const result = await aiService.draftCitizenResponse({
        complaint: activeItem,
        newStatus: editStatus,
        internalRemarks: editNote
      });
      if (result.draftedMessage) {
        setEditNote(result.draftedMessage);
      }
    } catch (err) {
      console.error('Failed to draft citizen response', err);
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!activeItem) return;

    setIsUpdating(true);
    try {
      // If department changed or assigned
      if (editDept !== activeItem.department || editOfficer !== activeItem.assignedOfficer) {
        await complaintService.assignDepartment(
          activeItem.id,
          editDept,
          activeItem.priority,
          editOfficer || 'Field Operations Crew'
        );
      }

      // If status changed
      if (editStatus !== activeItem.status || editNote) {
        await complaintService.updateStatus(
          activeItem.id,
          editStatus,
          editNote || `Status updated to ${editStatus} by ${user?.name || 'Officer'}.`,
          user?.name || 'Officer'
        );
      }

      setToastMessage(`Ticket #${activeItem.id} updated successfully!`);
      setActiveItem(null);
      await fetchComplaints();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update complaint', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Municipal Triage Portal</span>
            <span>·</span>
            <span>Dispatch Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Grievance Redressal &amp; Work Orders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Assign departments, update progress milestones, and manage field crews
          </p>
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID, keyword, complainant name or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* 5-Column Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          
          <div className="space-y-1">
            <label className="text-slate-500 font-semibold">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 font-semibold">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 font-semibold">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="All">All Categories</option>
              {ISSUE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 font-semibold">Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 font-semibold">Ward:</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="All">All Wards</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>{w.split(' - ')[0]}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {loading && <TableSkeleton rows={7} />}

        {!loading && complaints.length === 0 && (
          <EmptyState
            title="No complaints matching criteria"
            description="Clear filters to inspect other municipal tickets."
            actionLabel="Reset Filters"
            onActionClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setPriorityFilter('All');
              setCategoryFilter('All');
              setDepartmentFilter('All');
              setWardFilter('All');
            }}
          />
        )}

        {!loading && complaints.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Problem Details &amp; Address</th>
                  <th className="py-3.5 px-4">Department &amp; Officer</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-700 block">{item.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.reportedDate).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.category}
                    </td>

                    <td className="py-3.5 px-4 max-w-[260px]">
                      <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">📍 {item.location?.address}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-medium text-slate-800 truncate">{item.department}</div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">
                        👤 {item.assignedOfficer || 'Unassigned'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openActionModal(item)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Dispatch / Status
                      </button>
                      <Link
                        to={`/complaints/${item.id}`}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Action Modal for Status Update / Department Assignment */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono text-blue-600 font-bold uppercase">
                  Ticket Triage &amp; Crew Assignment
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {activeItem.id} · {activeItem.category}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Copilot Action Box */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <span>Gemini Municipal Dispatch Copilot</span>
                </div>
                <button
                  type="button"
                  onClick={handleFetchAITriage}
                  disabled={aiTriageLoading}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3 h-3 ${aiTriageLoading ? 'animate-spin' : ''}`} />
                  <span>{aiTriageLoading ? 'Analyzing...' : 'Generate AI Work Order'}</span>
                </button>
              </div>

              {aiTriageData ? (
                <div className="text-[11px] text-slate-700 space-y-1.5 pt-1 border-t border-indigo-200/60">
                  <div className="flex items-center justify-between font-mono">
                    <span>Suggested Priority: <strong className="text-indigo-900">{aiTriageData.suggestedPriority}</strong></span>
                    <span>Crew: <strong className="text-indigo-900">{aiTriageData.crewSize}</strong></span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Work Order Steps:</span>
                    <ul className="list-disc list-inside text-slate-600 pl-1 mt-0.5 space-y-0.5">
                      {aiTriageData.workOrderSteps?.map((step, idx) => (
                        <li key={idx} className="truncate">{step}</li>
                      ))}
                    </ul>
                  </div>
                  {aiTriageData.requiredEquipment && (
                    <div className="text-[10px] text-slate-500 truncate">
                      Equip: {aiTriageData.requiredEquipment.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Click to auto-generate equipment checklist, contractor work steps, and official audit remarks.
                </p>
              )}
            </div>

            <form onSubmit={handleSaveAction} className="space-y-4 text-xs">
              
              {/* Department */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assign Responsible Department:</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Officer */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Field Officer / Crew Lead Name:</label>
                <input
                  type="text"
                  value={editOfficer}
                  onChange={(e) => setEditOfficer(e.target.value)}
                  placeholder="e.g. Er. S. P. Gupta (Roads Unit 2)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Workflow Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="Reported">Reported (Logged)</option>
                  <option value="Verified">Verified (Confirmed on site)</option>
                  <option value="Assigned">Assigned (Team mobilised)</option>
                  <option value="In Progress">In Progress (Active repairs)</option>
                  <option value="Resolved">Resolved (Work closed)</option>
                  <option value="Rejected">Rejected (Out of municipal remit)</option>
                </select>
              </div>

              {/* Notes with AI Citizen Draft Trigger */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Official Action Notes:</label>
                  <button
                    type="button"
                    onClick={handleDraftCitizenResponse}
                    disabled={aiDraftLoading}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{aiDraftLoading ? 'Drafting...' : 'AI Draft Citizen Update'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="e.g. Dispatched asphalt roller crew. Pavement leveled."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Apply Work Order'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
