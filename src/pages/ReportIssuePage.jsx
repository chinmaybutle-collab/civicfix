import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { aiService } from '../services/aiService';
import { ISSUE_CATEGORIES, WARDS } from '../services/mockData';
import LeafletMap from '../components/LeafletMap';
import StatusBadge from '../components/StatusBadge';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Upload, 
  AlertCircle, 
  Navigation, 
  ArrowRight, 
  Image as ImageIcon, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  Phone,
  Mail,
  User,
  BrainCircuit,
  Wrench,
  Clock,
  Check
} from 'lucide-react';

const SAMPLE_CIVIC_PHOTOS = [
  { label: 'Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Garbage', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80' },
  { label: 'Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80' },
  { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80' }
];

export default function ReportIssuePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialCat = searchParams.get('category') || 'pothole';

  const [categoryId, setCategoryId] = useState(initialCat);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [locationPin, setLocationPin] = useState({ lat: 28.6139, lng: 77.2090 });
  const [address, setAddress] = useState('Near Metro Pillar 142, Ring Road');
  const [ward, setWard] = useState(WARDS[0]);
  const [priority, setPriority] = useState('Medium');
  
  // AI Smart Assistant state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);

  // Optional contact info
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.mobile || '');
  const [citizenEmail, setCitizenEmail] = useState(user?.email || '');

  // Submission & feedback states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    const qCat = searchParams.get('category');
    if (qCat) setCategoryId(qCat);
  }, [searchParams]);

  // Set default sample photo when category changes if user hasn't uploaded one
  useEffect(() => {
    if (!imageUrl) {
      if (categoryId === 'pothole') setImageUrl(SAMPLE_CIVIC_PHOTOS[0].url);
      else if (categoryId === 'garbage' || categoryId === 'illegal_dumping') setImageUrl(SAMPLE_CIVIC_PHOTOS[1].url);
      else if (categoryId === 'streetlight') setImageUrl(SAMPLE_CIVIC_PHOTOS[2].url);
      else if (categoryId === 'water_leakage' || categoryId === 'drainage') setImageUrl(SAMPLE_CIVIC_PHOTOS[3].url);
      else setImageUrl(SAMPLE_CIVIC_PHOTOS[0].url);
    }
  }, [categoryId, imageUrl]);

  const handleLocationSelect = (loc) => {
    setLocationPin({ lat: loc.lat, lng: loc.lng });
    if (loc.address) {
      setAddress(loc.address);
    } else {
      setAddress(`GPS Pin (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}) - ${ward.split(' - ')[0]}`);
    }
  };

  const handleAIDiagnose = async () => {
    if (!description.trim()) {
      setErrors({ description: 'Please type a short description first so the AI can diagnose the issue.' });
      return;
    }
    setIsDiagnosing(true);
    setErrors({});
    try {
      const result = await aiService.diagnoseIssue({
        description,
        categoryHint: categoryId,
        locationHint: address
      });
      setAiDiagnosis(result);
      if (result.severity) {
        setPriority(result.severity);
      }
      if (result.categoryId) {
        setCategoryId(result.categoryId);
      }
    } catch (err) {
      console.error('AI diagnosis error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const err = {};
    if (!description.trim()) {
      err.description = 'Please describe the issue in detail.';
    } else if (description.trim().length < 10) {
      err.description = 'Description should be at least 10 characters.';
    }
    if (!address.trim()) {
      err.address = 'Street address or location landmark is required.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const catObj = ISSUE_CATEGORIES.find((c) => c.id === categoryId);
      const categoryLabel = catObj ? catObj.label : 'Other Civic Issue';

      const result = await complaintService.createComplaint({
        categoryId,
        category: categoryLabel,
        title: `${categoryLabel} reported at ${address}`,
        description,
        address,
        lat: locationPin.lat,
        lng: locationPin.lng,
        ward,
        priority,
        imageUrl: imageUrl || SAMPLE_CIVIC_PHOTOS[0].url,
        citizenId: user?.id || 'citizen_anon',
        citizenName: isAnonymous ? 'Anonymous Citizen' : citizenName || 'Concerned Citizen',
        citizenPhone: isAnonymous ? 'Hidden' : citizenPhone || '+91 98000 00000',
        citizenEmail: isAnonymous ? 'Hidden' : citizenEmail || 'citizen@civicfix.org'
      });

      setSubmittedData(result);
    } catch (err) {
      console.error('Failed to submit complaint', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <span>Municipal Citizen Service</span>
          <span>·</span>
          <span>Fast-Track Redressal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Issue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Help our municipal crews detect and repair neighborhood infrastructure faults quickly.
        </p>
      </div>

      {/* Confirmation Card after Submission */}
      {submittedData ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-lg text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="w-18 h-18 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
              Grievance Registered
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Issue Reported Successfully!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your complaint has been logged and dispatched to the municipal central control room.
            </p>
          </div>

          {/* Generated Confirmation Ticket Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-lg mx-auto text-left space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Complaint Reference ID</div>
                <div className="text-xl font-extrabold font-mono text-blue-700 mt-0.5">{submittedData.id}</div>
              </div>
              <StatusBadge status={submittedData.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 block font-medium">Category:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{submittedData.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Priority Assigned:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{submittedData.priority}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Location:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">📍 {submittedData.location.address}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={`/complaints/${submittedData.id}`}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Track Complaint Status</span>
            </Link>

            <Link
              to="/citizen/dashboard"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => {
                setSubmittedData(null);
                setDescription('');
                setImagePreview('');
              }}
              className="px-5 py-3 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
            >
              + Report Another Issue
            </button>
          </div>

        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
          
          {/* 1. Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
              <span>Select Issue Category <strong className="text-rose-500">*</strong></span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ISSUE_CATEGORIES.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600/30 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xs">{cat.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                <span>Problem Description <strong className="text-rose-500">*</strong></span>
              </label>
              <span className="text-[11px] text-slate-400">Min 10 characters</span>
            </div>
            
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details such as size, hazard level, landmarks, vehicle damage risk, or duration of the problem..."
              className={`w-full p-3.5 bg-slate-50 border rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.description ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500">{errors.description}</p>
            )}

            {/* AI Assistant Quick Trigger */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Want AI to categorize and assess hazard automatically?
              </span>
              <button
                type="button"
                onClick={handleAIDiagnose}
                disabled={isDiagnosing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                <span>{isDiagnosing ? 'Gemini AI Analyzing...' : 'AI Auto-Detect & Assess'}</span>
              </button>
            </div>

            {/* AI Diagnostic Report Banner */}
            {aiDiagnosis && (
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/90 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <BrainCircuit className="w-4 h-4 text-blue-600" />
                    <span>Gemini AI Civic Diagnosis</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded font-bold">
                    Hazard: {aiDiagnosis.severity} ({aiDiagnosis.hazardScore || 75}/100)
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1.5">
                  <p className="leading-relaxed">
                    <strong className="text-slate-900">Assessment: </strong>
                    {aiDiagnosis.safetyRisk || aiDiagnosis.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                    <span className="bg-white/80 border border-blue-200 px-2 py-0.5 rounded text-blue-800">
                      Category: <strong>{aiDiagnosis.detectedCategory}</strong>
                    </span>
                    <span className="bg-white/80 border border-blue-200 px-2 py-0.5 rounded text-blue-800">
                      Dept: <strong>{aiDiagnosis.recommendedDepartment}</strong>
                    </span>
                    <span className="bg-white/80 border border-blue-200 px-2 py-0.5 rounded text-blue-800">
                      Est. SLA: <strong>{aiDiagnosis.estimatedRepairDuration || '24-48h'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Category &amp; Priority auto-applied from AI diagnosis!</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Image Upload & Photo Samples */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
              <span>Upload Photo Evidence</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* File upload box */}
              <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/60 rounded-2xl p-6 text-center transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Click to capture or upload photo
                  </div>
                  <p className="text-[11px] text-slate-400">PNG, JPG or JPEG up to 10MB</p>
                </div>
              </div>

              {/* Preview image */}
              <div className="space-y-2">
                <div className="relative h-36 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Issue Evidence Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-400 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}
                </div>

                {/* Instant sample images for easy evaluation */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 text-[10px] font-mono shrink-0">Sample Photos:</span>
                  {SAMPLE_CIVIC_PHOTOS.map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => setImageUrl(sp.url)}
                      className={`px-2 py-0.5 rounded text-[10px] border whitespace-nowrap ${
                        imageUrl === sp.url
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Interactive Location & Leaflet Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
                <span>Pin Location on Map <strong className="text-rose-500">*</strong></span>
              </label>
              <span className="text-[11px] text-slate-500">Click map to drop marker</span>
            </div>

            {/* Interactive Leaflet Pin Dropper */}
            <LeafletMap
              mode="picker"
              selectedLocation={locationPin}
              onLocationSelect={handleLocationSelect}
              height="280px"
              defaultZoom={14}
            />

            {/* Address & Ward inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Street Address / Landmark Details
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Opposite City Hospital Gate 2, Ring Road"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {errors.address && <p className="text-[11px] text-rose-500">{errors.address}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Municipal Ward
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Priority & Optional Contact Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">5</span>
                  <span>Urgency / Hazard Priority</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">Indicate severity to aid triage priority</p>
              </div>

              <div className="flex items-center gap-1.5">
                {['Low', 'Medium', 'High', 'Critical'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      priority === lvl
                        ? lvl === 'Critical' ? 'bg-rose-600 text-white' : lvl === 'High' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800">Report Anonymously</span>
                <p className="text-[11px] text-slate-500">Hide your name and contact details from the public record</p>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Contact details row if not anonymous */}
            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">Your Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">Mobile Phone</label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">Email (For Updates)</label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="updates@email.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Complaint Ticket...</span>
              ) : (
                <>
                  <span>Submit Civic Complaint</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              By submitting, you certify that the information provided is accurate and representative of local conditions.
            </p>
          </div>

        </form>
      )}

    </div>
  );
}
