import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import LeafletMap from '../components/LeafletMap';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building2, 
  UserCheck, 
  Star, 
  Share2, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Send,
  BrainCircuit,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { DEPARTMENTS } from '../services/mockData';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthority, user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // AI Plan state
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlanData, setAiPlanData] = useState(null);

  // Citizen feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Authority quick-action state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [officerNote, setOfficerNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaintById(id);
      if (data) {
        setComplaint(data);
        setNewStatus(data.status);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to load complaint', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const handleGenerateAIPlan = async () => {
    if (!complaint) return;
    setAiPlanLoading(true);
    try {
      const plan = await aiService.triageComplaint(complaint);
      setAiPlanData(plan);
    } catch (err) {
      console.error('Failed to generate AI plan', err);
    } finally {
      setAiPlanLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    try {
      const updated = await complaintService.submitFeedback(complaint.id, {
        rating,
        comment: feedbackComment
      });
      setComplaint(updated);
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await complaintService.updateStatus(
        complaint.id,
        newStatus,
        officerNote || `Status updated to ${newStatus} by ${user?.name || 'Municipal Officer'}.`,
        user?.name || 'Municipal Officer'
      );
      setComplaint(updated);
      setShowStatusModal(false);
      setActionSuccess(`Status successfully changed to ${newStatus}`);
      setOfficerNote('');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (notFound || !complaint) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">
          No record exists with ID "{id}". Please verify the complaint ID format (e.g. CIV-2026-00108).
        </p>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Status Notification */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {actionSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{actionSuccess}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
            title="Print Official Complaint Receipt"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Receipt</span>
          </button>

          {isAuthority && (
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <span>Update Status / Assign</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-blue-700 tracking-tight">
                {complaint.id}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} size="md" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{complaint.location.address}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Reported on {new Date(complaint.reportedDate).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:text-right shrink-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Department</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{complaint.department}</div>
            <div className="text-xs text-slate-500 mt-1">Officer: {complaint.assignedOfficer || 'Pending Dispatch'}</div>
          </div>
        </div>

        {/* 2-Column Main Section: Progress Timeline vs Evidence & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Progress Timeline & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Visual Resolution Progression Timeline */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center justify-between">
                <span>Resolution Milestone Tracking</span>
                <span className="text-xs font-mono text-blue-600 font-semibold">{complaint.status}</span>
              </h3>
              <Timeline timeline={complaint.timeline} currentStatus={complaint.status} />
            </div>

            {/* Problem Detailed Statement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Citizen Grievance Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* AI Operational Assessment Card */}
            <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 rounded-2xl border border-indigo-200/90 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">AI Contractor Work Order &amp; Safety Plan</h3>
                    <p className="text-[11px] text-slate-500">Autonomous engineering repair breakdown powered by Gemini</p>
                  </div>
                </div>

                {!aiPlanData && (
                  <button
                    type="button"
                    onClick={handleGenerateAIPlan}
                    disabled={aiPlanLoading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiPlanLoading ? 'animate-spin' : ''}`} />
                    <span>{aiPlanLoading ? 'Synthesizing...' : 'Generate AI Plan'}</span>
                  </button>
                )}
              </div>

              {aiPlanData && (
                <div className="space-y-3 pt-2 border-t border-indigo-200/60 text-xs text-slate-700 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-900 font-semibold">
                      Priority: <strong>{aiPlanData.suggestedPriority}</strong>
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-900 font-semibold">
                      Required Crew: <strong>{aiPlanData.crewSize}</strong>
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-900 font-semibold">
                      Timeframe: <strong>{aiPlanData.dispatchTimeframe}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Standard Operating Procedure:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      {aiPlanData.workOrderSteps?.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {aiPlanData.requiredEquipment && (
                    <div className="p-2.5 bg-white/80 rounded-xl border border-indigo-200/80 text-[11px]">
                      <span className="font-bold text-slate-900">Required Contractor Tools: </span>
                      <span className="text-slate-600">{aiPlanData.requiredEquipment.join(' · ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Citizen Feedback Component */}
            {isResolved && (
              <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Resolution Feedback</h3>
                    <p className="text-xs text-emerald-700">Rate the quality and speed of this municipal repair</p>
                  </div>
                </div>

                {complaint.feedback ? (
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: complaint.feedback.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 italic">"{complaint.feedback.comment}"</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Submitted on {new Date(complaint.feedback.submittedDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-emerald-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Satisfaction Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Citizen Remarks
                      </label>
                      <textarea
                        rows={2}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Was the problem fixed satisfactorily? Are there any remaining debris or issues?"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Citizen Review</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Evidence Photo & Interactive Map (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Photographic Evidence */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Photographic Evidence</span>
                <span className="text-[11px] font-mono text-slate-400">Geo-tagged</span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
                {complaint.imageUrl ? (
                  <img
                    src={complaint.imageUrl}
                    alt={complaint.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No photographic record attached</span>
                )}
              </div>
            </div>

            {/* Geographic Pinpoint Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Geographic Pinpoint</span>
                <span className="text-blue-600 font-mono text-[11px]">
                  {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
                </span>
              </div>

              <LeafletMap
                mode="single"
                singleComplaint={complaint}
                height="240px"
                defaultZoom={15}
              />

              <div className="text-[11px] text-slate-500 font-medium">
                📍 {complaint.location.ward}
              </div>
            </div>

            {/* Citizen Contact Profile Card (Authorized view) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                Complainant Record
              </div>
              <div className="font-semibold text-slate-800">{complaint.citizenName}</div>
              <div className="text-slate-500 font-mono">{complaint.citizenPhone}</div>
              <div className="text-slate-500">{complaint.citizenEmail}</div>
            </div>

          </div>

        </div>
      </div>

      {/* Authority Quick Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Update Complaint #{complaint.id}
            </h3>
            
            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Set New Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Audit Remarks / Field Notes:</label>
                <textarea
                  rows={3}
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="e.g. Patching truck dispatched; work commenced with 4 workers and road cones."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
