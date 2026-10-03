import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Camera, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Building2, 
  BarChart3,
  AlertCircle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Construction,
  Radio,
  AlertTriangle,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { ISSUE_CATEGORIES } from '../services/mockData';

export default function LandingPage() {
  const [trackId, setTrackId] = useState('');
  const [trackError, setTrackError] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackId.trim()) {
      setTrackError('Please enter a complaint ID (e.g. CIV-2026-00108)');
      return;
    }
    const cleanId = trackId.trim().toUpperCase();
    navigate(`/complaints/${cleanId}`);
  };

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'pothole': return AlertCircle;
      case 'garbage': return Trash2;
      case 'streetlight': return Lightbulb;
      case 'water_leakage': return Droplets;
      case 'drainage': return Waves;
      case 'road_damage': return Construction;
      case 'traffic_signal': return Radio;
      case 'illegal_dumping': return AlertTriangle;
      default: return HelpCircle;
    }
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 border-b border-slate-200/80">
        {/* Subtle geometric dot pattern */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* GovTech Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold border border-blue-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Smart Municipal Grievance &amp; Redressal Portal</span>
            </div>

            {/* Unmistakable Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Your City. Your Voice. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Better Together.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Report civic problems in seconds and track their resolution from anywhere. Empowering citizens with real-time transparency and accountability.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to="/report"
                className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Report an Issue</span>
              </Link>

              <Link
                to="/complaints"
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-sm transition-all hover:border-slate-400"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Track My Complaint</span>
              </Link>
            </div>

            {/* Quick Track Input Bar */}
            <div className="pt-6 max-w-md mx-auto">
              <form onSubmit={handleTrackSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value);
                    if (trackError) setTrackError('');
                  }}
                  placeholder="Enter Complaint ID (e.g. CIV-2026-00108)"
                  className="w-full pl-4 pr-28 py-3 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs uppercase font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {trackError && (
                <p className="text-xs text-rose-500 mt-1.5 text-left pl-2">{trackError}</p>
              )}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2 font-mono">
                <span>Try sample:</span>
                <button
                  type="button"
                  onClick={() => setTrackId('CIV-2026-00108')}
                  className="text-blue-600 hover:underline"
                >
                  CIV-2026-00108
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setTrackId('CIV-2026-00115')}
                  className="text-blue-600 hover:underline"
                >
                  CIV-2026-00115
                </button>
              </div>
            </div>

          </div>

          {/* Quick Stats Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-blue-600 font-mono">14,892+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Issues Reported</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-emerald-600 font-mono">92.4%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Resolution Rate</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-indigo-600 font-mono">24-48h</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Average Turnaround</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-slate-900 font-mono">6 Wards</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">100% City Coverage</div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Transparent Workflow
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How CivicFix Works
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            From your phone to the municipal field crew in three verified steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg ring-8 ring-blue-50/50">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Step 01</span>
            <h3 className="text-xl font-bold text-slate-900">Snap &amp; Geotag</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Capture a photograph of the problem. Our interactive map automatically detects your GPS coordinates or lets you drop a pin anywhere in the city.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg ring-8 ring-indigo-50/50">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Step 02</span>
            <h3 className="text-xl font-bold text-slate-900">Department Dispatch</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The municipal triage desk verifies your complaint, assigns a priority level, and automatically notifies the relevant ward officer and field crew.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Step 03</span>
            <h3 className="text-xl font-bold text-slate-900">Track &amp; Rate Resolution</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Receive timeline updates as the crew repairs the issue. Once completed, inspect before/after photos and submit your satisfaction feedback.
            </p>
          </div>

        </div>
      </section>

      {/* Civic Issue Categories Grid */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Service Taxonomy
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Report Any Local Problem
            </h2>
            <p className="text-slate-600 text-sm">
              Click a category to immediately start a pre-filled complaint report.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {ISSUE_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              return (
                <Link
                  key={cat.id}
                  to={`/report?category=${cat.id}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits for Citizens & Authorities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>For Citizens</span>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              No More Bureaucratic Runarounds. Clear Progress at Every Step.
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">60-Second Mobile Reporting</h4>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    Zero complicated paperwork. Snap a photo, confirm GPS pin, and submit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Transparent Audit Trail</h4>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    View officer notes, assigned department names, and real-time status transitions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Citizen Rating &amp; Verification</h4>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    Work isn't closed until you confirm the resolution meets community standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Create Citizen Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Authority feature highlight box */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Municipal Authorities</span>
            </div>

            <h3 className="text-2xl font-bold leading-tight">
              Data-Driven Field Dispatch &amp; Geographic Command Center
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              CivicFix aggregates city complaints into a unified GIS heatmap. Department heads can assign crews, prioritize hazardous potholes, and monitor ward resolution SLA trends in real time.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold font-mono text-indigo-400">GIS Heatmap</div>
                <div className="text-xs text-slate-300 mt-1">Live spatial cluster map of open civic grievances</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold font-mono text-emerald-400">SLA Alerts</div>
                <div className="text-xs text-slate-300 mt-1">Auto-escalation for critical hazards exceeding 48h</div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/authority/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
              >
                <span>Launch Authority Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-8 sm:p-14 text-center shadow-xl shadow-blue-500/10 space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Spot a Problem in Your Street?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Don't wait for someone else. Report it now and help your local municipal council fix it faster.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/report"
                className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                + Report an Issue Now
              </Link>
              <Link
                to="/complaints"
                className="px-6 py-3.5 bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors"
              >
                Explore City Complaints
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
