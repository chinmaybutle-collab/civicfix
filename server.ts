import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Parse JSON bodies with up to 15MB limit for photo uploads
app.use(express.json({ limit: '15mb' }));

// -----------------------------------------------------------------------------
// Database Persistence Layer (JSON file database in data/database.json)
// -----------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_SEED_COMPLAINTS = [
  {
    id: 'CIV-2026-00108',
    category: 'Pothole',
    categoryId: 'pothole',
    title: 'Severe pothole near Metro Pillar 142',
    description: 'Deep pothole roughly 2 feet wide on the main carriage way causing dangerous lane swerving and vehicle tire punctures during rush hour.',
    location: {
      address: 'Near Metro Pillar 142, Ring Road, Ward 4',
      lat: 28.6139,
      lng: 77.2090,
      ward: 'Ward 4 - Metro Station Corridor'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    status: 'In Progress',
    priority: 'Critical',
    citizenName: 'Rahul Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'rahul.citizen@civicfix.org',
    reportedDate: '2026-09-28T09:30:00Z',
    department: 'Roads & Bridges (PWD)',
    assignedOfficer: 'Er. A. K. Verma (Senior PWD Inspector)',
    timeline: [
      { status: 'Reported', date: '2026-09-28T09:30:00Z', note: 'Issue submitted via CivicFix Mobile Portal with geo-coordinates and photo.' },
      { status: 'Verified', date: '2026-09-28T11:15:00Z', note: 'Central Control Room verified urgency and risk to two-wheelers.' },
      { status: 'Assigned', date: '2026-09-28T14:00:00Z', note: 'Transferred to Roads & Bridges (PWD) Quick Response Team #4.' },
      { status: 'In Progress', date: '2026-09-29T08:45:00Z', note: 'Hot-mix asphalt patch team dispatched to site with traffic barriers.' }
    ],
    feedback: null
  },
  {
    id: 'CIV-2026-00115',
    category: 'Streetlight',
    categoryId: 'streetlight',
    title: 'Three consecutive streetlights dark on 4th Cross',
    description: 'Lamp posts #28, #29, and #30 are non-functional for past 4 days, causing total darkness and safety concerns for women and evening pedestrians.',
    location: {
      address: '4th Cross, 9th Main, Green Valley Enclave, Ward 3',
      lat: 28.6250,
      lng: 77.2180,
      ward: 'Ward 3 - Green Valley Enclave'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    status: 'Resolved',
    priority: 'High',
    citizenName: 'Priya Narayanan',
    citizenPhone: '+91 98123 45678',
    citizenEmail: 'priya.n@civicfix.org',
    reportedDate: '2026-09-25T19:40:00Z',
    department: 'Electrical & Street Lighting',
    assignedOfficer: 'Suresh Menon (Electrical Superintendent)',
    timeline: [
      { status: 'Reported', date: '2026-09-25T19:40:00Z', note: 'Complaint logged with streetlight pole IDs.' },
      { status: 'Verified', date: '2026-09-26T09:10:00Z', note: 'Ward 3 Electrical sub-division logged circuit breaker fault.' },
      { status: 'Assigned', date: '2026-09-26T10:30:00Z', note: 'Assigned to Line Maintenance Crew A.' },
      { status: 'In Progress', date: '2026-09-26T15:20:00Z', note: 'Substation junction box opened; faulty 63A timer switch replaced.' },
      { status: 'Resolved', date: '2026-09-26T18:30:00Z', note: 'LED luminaires restored. Luminance verified at 28 lux.' }
    ],
    feedback: {
      rating: 5,
      comment: 'Very fast resolution within 24 hours! The street is properly illuminated now. Thank you CivicFix team.'
    }
  },
  {
    id: 'CIV-2026-00122',
    category: 'Water Leakage',
    categoryId: 'water_leakage',
    title: 'Major main line pipe burst under sidewalk',
    description: 'Clean potable water gushing onto sidewalk and flooding basements of commercial shops. Estimated thousands of liters wasting every hour.',
    location: {
      address: 'Corner of Bank Street, Riverside Boulevard, Ward 2',
      lat: 28.6320,
      lng: 77.2250,
      ward: 'Ward 2 - Riverside Boulevard'
    },
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
    status: 'Assigned',
    priority: 'Critical',
    citizenName: 'Anil Gupta',
    citizenPhone: '+91 99887 76655',
    citizenEmail: 'anil.gupta@civicfix.org',
    reportedDate: '2026-10-01T07:15:00Z',
    department: 'Water Supply & Sewerage Board',
    assignedOfficer: 'Deepak Joshi (Assistant Executive Engineer)',
    timeline: [
      { status: 'Reported', date: '2026-10-01T07:15:00Z', note: 'High volume leakage reported.' },
      { status: 'Verified', date: '2026-10-01T07:45:00Z', note: 'Telemetry confirmed pressure drop on 300mm distribution trunk.' },
      { status: 'Assigned', date: '2026-10-01T08:10:00Z', note: 'Emergency sluice valve team notified to isolate segment.' }
    ],
    feedback: null
  },
  {
    id: 'CIV-2026-00130',
    category: 'Garbage & Waste',
    categoryId: 'garbage',
    title: 'Overflowing community garbage dumpster attracting strays',
    description: 'Bin has not been cleared for 3 days. Trash spilled across 15 meters of footpath, foul smell entering nearby residential apartments.',
    location: {
      address: 'Behind Municipal School, Ward 1 - Central CBD',
      lat: 28.6080,
      lng: 77.2140,
      ward: 'Ward 1 - Central Business District'
    },
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    status: 'Verified',
    priority: 'Medium',
    citizenName: 'Sunita Rao',
    citizenPhone: '+91 97654 32109',
    citizenEmail: 'sunita.rao@civicfix.org',
    reportedDate: '2026-10-02T06:50:00Z',
    department: 'Solid Waste Management',
    assignedOfficer: 'Unassigned',
    timeline: [
      { status: 'Reported', date: '2026-10-02T06:50:00Z', note: 'Reported with geo-tagged photograph.' },
      { status: 'Verified', date: '2026-10-02T08:00:00Z', note: 'Sanitation supervisor confirmed bin overflow.' }
    ],
    feedback: null
  },
  {
    id: 'CIV-2026-00138',
    category: 'Drainage & Sewage',
    categoryId: 'drainage',
    title: 'Stormwater drain blocked by construction debris',
    description: 'Contractor dumped gravel into roadside drain inlet. During light rain, water stagnant and rising onto the pedestrian sidewalk.',
    location: {
      address: 'Plot 45, Phase 2, Industrial Park West, Ward 5',
      lat: 28.5980,
      lng: 77.1950,
      ward: 'Ward 5 - Industrial Park West'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    status: 'Reported',
    priority: 'Medium',
    citizenName: 'Vikram Joshi',
    citizenPhone: '+91 98450 11223',
    citizenEmail: 'vikram.j@civicfix.org',
    reportedDate: '2026-10-02T14:20:00Z',
    department: 'Stormwater & Drainage Dept',
    assignedOfficer: 'Pending Verification',
    timeline: [
      { status: 'Reported', date: '2026-10-02T14:20:00Z', note: 'Citizen logged issue. Awaiting automated dispatch triage.' }
    ],
    feedback: null
  },
  {
    id: 'CIV-2026-00142',
    category: 'Road Damage',
    categoryId: 'road_damage',
    title: 'Dislodged cast iron manhole cover on blind turn',
    description: 'The circular manhole frame has collapsed by 6 inches. Cars hitting it abruptly, risk of fatal motorcycle overturn.',
    location: {
      address: 'Old Post Office Junction, Heritage Old Town, Ward 6',
      lat: 28.6410,
      lng: 77.2340,
      ward: 'Ward 6 - Heritage Old Town'
    },
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    status: 'In Progress',
    priority: 'Critical',
    citizenName: 'Farhan Ali',
    citizenPhone: '+91 91234 56780',
    citizenEmail: 'farhan.ali@civicfix.org',
    reportedDate: '2026-10-01T16:00:00Z',
    department: 'Roads & Bridges (PWD)',
    assignedOfficer: 'Er. R. S. Rathore',
    timeline: [
      { status: 'Reported', date: '2026-10-01T16:00:00Z', note: 'Emergency hazard reported.' },
      { status: 'Verified', date: '2026-10-01T16:25:00Z', note: 'Flagged as High Hazard.' },
      { status: 'Assigned', date: '2026-10-01T17:00:00Z', note: 'PWD Emergency Squad mobilized.' },
      { status: 'In Progress', date: '2026-10-02T09:00:00Z', note: 'Temporary steel plate placed; new ductile iron frame curing with rapid-set concrete.' }
    ],
    feedback: null
  }
];

function readDB(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED_COMPLAINTS, null, 2), 'utf-8');
      return INITIAL_SEED_COMPLAINTS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, using fallback:', err);
    return INITIAL_SEED_COMPLAINTS;
  }
}

function writeDB(data: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing to database:', err);
  }
}

// -----------------------------------------------------------------------------
// Google Gemini AI Client Initialization (Server-Side)
// -----------------------------------------------------------------------------
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// GET /api/complaints - Fetch with filters and search
app.get('/api/complaints', (req: Request, res: Response) => {
  const { status, category, priority, department, ward, search } = req.query as Record<string, string>;
  let list = readDB();

  if (status && status !== 'All') {
    list = list.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }
  if (category && category !== 'All') {
    list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase() || c.categoryId === category);
  }
  if (priority && priority !== 'All') {
    list = list.filter((c) => c.priority.toLowerCase() === priority.toLowerCase());
  }
  if (department && department !== 'All') {
    list = list.filter((c) => c.department === department);
  }
  if (ward && ward !== 'All') {
    list = list.filter((c) => c.location && c.location.ward === ward);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((c) =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.location && c.location.address && c.location.address.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q)
    );
  }

  // Sort descending
  list.sort((a: any, b: any) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());
  res.json(list);
});

// GET /api/complaints/:id - Fetch single complaint
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = readDB();
  const found = list.find((c: any) => c.id.toUpperCase() === id.toUpperCase());
  if (!found) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json(found);
});

// POST /api/complaints - Create new complaint
app.post('/api/complaints', (req: Request, res: Response) => {
  const body = req.body;
  const list = readDB();

  const year = new Date().getFullYear();
  const nextNum = list.length + 101;
  const newId = `CIV-${year}-${String(nextNum).padStart(5, '0')}`;

  const newComplaint = {
    id: newId,
    category: body.category || 'Other Civic Issue',
    categoryId: body.categoryId || 'other',
    title: body.title || `${body.category || 'Civic Issue'} reported at ${body.address || 'Local Site'}`,
    description: body.description || '',
    location: {
      address: body.address || 'Address provided on GPS',
      lat: body.lat || 28.6139,
      lng: body.lng || 77.2090,
      ward: body.ward || 'Ward 1 - Central Business District'
    },
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    status: 'Reported',
    priority: body.priority || 'Medium',
    citizenName: body.citizenName || 'Concerned Citizen',
    citizenPhone: body.citizenPhone || '+91 98000 00000',
    citizenEmail: body.citizenEmail || 'citizen@civicfix.org',
    reportedDate: new Date().toISOString(),
    department: body.department || 'Pending Department Assignment',
    assignedOfficer: 'Central Triage Queue',
    timeline: [
      {
        status: 'Reported',
        date: new Date().toISOString(),
        note: 'Complaint registered by citizen with geolocation and image verification.'
      }
    ],
    feedback: null
  };

  const updated = [newComplaint, ...list];
  writeDB(updated);
  res.status(201).json(newComplaint);
});

// PATCH /api/complaints/:id/status - Update complaint status
app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, officerName } = req.body;

  const list = readDB();
  const index = list.findIndex((c: any) => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const complaint = list[index];
  complaint.status = status;
  if (!complaint.timeline) complaint.timeline = [];
  complaint.timeline.push({
    status,
    date: new Date().toISOString(),
    note: note || `Status updated to ${status} by ${officerName || 'Municipal Officer'}.`
  });

  list[index] = complaint;
  writeDB(list);
  res.json(complaint);
});

// PATCH /api/complaints/:id/assign - Assign department & crew
app.patch('/api/complaints/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { department, priority, assignedOfficer } = req.body;

  const list = readDB();
  const index = list.findIndex((c: any) => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const complaint = list[index];
  if (department) complaint.department = department;
  if (priority) complaint.priority = priority;
  if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;
  if (complaint.status === 'Reported') {
    complaint.status = 'Assigned';
  }

  complaint.timeline.push({
    status: complaint.status,
    date: new Date().toISOString(),
    note: `Assigned to ${department} (${assignedOfficer || 'Field Operations Crew'}) with priority ${priority || complaint.priority}.`
  });

  list[index] = complaint;
  writeDB(list);
  res.json(complaint);
});

// POST /api/complaints/:id/feedback - Submit citizen rating & review
app.post('/api/complaints/:id/feedback', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const list = readDB();
  const index = list.findIndex((c: any) => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  list[index].feedback = {
    rating: Number(rating) || 5,
    comment: comment || '',
    submittedDate: new Date().toISOString()
  };

  writeDB(list);
  res.json(list[index]);
});

// GET /api/analytics - Aggregated platform statistics
app.get('/api/analytics', (req: Request, res: Response) => {
  const complaints = readDB();
  const total = complaints.length;
  const reported = complaints.filter((c) => c.status === 'Reported').length;
  const verified = complaints.filter((c) => c.status === 'Verified').length;
  const assigned = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const WARDS = [
    'Ward 1 - Central Business District',
    'Ward 2 - Riverside Boulevard',
    'Ward 3 - Green Valley Enclave',
    'Ward 4 - Metro Station Corridor',
    'Ward 5 - Industrial Park West',
    'Ward 6 - Heritage Old Town'
  ];

  const categoryCount: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const statusData = [
    { name: 'Reported', value: reported, color: '#F59E0B' },
    { name: 'Verified', value: verified, color: '#3B82F6' },
    { name: 'Assigned', value: assigned, color: '#6366F1' },
    { name: 'In Progress', value: inProgress, color: '#8B5CF6' },
    { name: 'Resolved', value: resolved, color: '#10B981' }
  ].filter((s) => s.value > 0);

  const wardData = WARDS.map((w) => {
    const shortName = w.split(' - ')[0];
    const wardComplaints = complaints.filter((c) => c.location && c.location.ward === w);
    const wardResolved = wardComplaints.filter((c) => c.status === 'Resolved').length;
    return {
      ward: shortName,
      total: wardComplaints.length,
      resolved: wardResolved,
      pending: wardComplaints.length - wardResolved
    };
  });

  const trendData = [
    { day: 'Mon', reported: 8, resolved: 6 },
    { day: 'Tue', reported: 12, resolved: 9 },
    { day: 'Wed', reported: 7, resolved: 11 },
    { day: 'Thu', reported: 14, resolved: 10 },
    { day: 'Fri', reported: 9, resolved: 12 },
    { day: 'Sat', reported: 6, resolved: 7 },
    { day: 'Sun', reported: 4, resolved: 5 }
  ];

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  res.json({
    total,
    reported,
    verified,
    assigned,
    inProgress,
    resolved,
    pendingTotal: reported + verified + assigned + inProgress,
    resolutionRate,
    avgResolutionHours: 28.4,
    categoryData,
    statusData,
    wardData,
    trendData
  });
});

// -----------------------------------------------------------------------------
// AI Endpoints powered by Gemini (gemini-3.8-flash)
// -----------------------------------------------------------------------------

// POST /api/ai/diagnose - Citizen AI Assistant: Auto-classify & assess hazard
app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  const { description, categoryHint, locationHint } = req.body;

  if (!description && !categoryHint) {
    return res.status(400).json({ error: 'Please provide an issue description or category.' });
  }

  // Fallback heuristic if API key is not present or offline
  const fallbackResult = {
    detectedCategory: categoryHint || 'Pothole',
    categoryId: (categoryHint || 'pothole').toLowerCase().replace(/\s+/g, '_'),
    severity: 'High',
    hazardScore: 78,
    safetyRisk: 'Presents moderate to high risk to pedestrian footing and vehicular suspension.',
    recommendedDepartment: 'Roads & Bridges (PWD)',
    estimatedRepairDuration: '24-48 Hours',
    recommendedMaterials: ['Cold mix asphalt patch', 'Vibratory plate compactor', 'High-visibility safety cones'],
    summary: `Reported issue at ${locationHint || 'the site'} requires road surface remediation.`
  };

  if (!ai) {
    return res.json({ ...fallbackResult, source: 'heuristic-engine' });
  }

  try {
    const prompt = `You are the CivicFix AI Smart Municipal Diagnostic System.
Analyze this citizen-reported civic issue and return a valid JSON object only (no markdown, no extra commentary):
Description: "${description || 'Civic infrastructure issue'}"
Category Context: "${categoryHint || 'Unknown'}"
Location: "${locationHint || 'Urban Area'}"

Allowed Categories:
- "Pothole" (id: "pothole")
- "Garbage & Waste" (id: "garbage")
- "Broken Streetlight" (id: "streetlight")
- "Water Leakage" (id: "water_leakage")
- "Drainage & Sewage" (id: "drainage")
- "Road Damage" (id: "road_damage")
- "Traffic Signal" (id: "traffic_signal")
- "Illegal Dumping" (id: "illegal_dumping")
- "Other Civic Issue" (id: "other")

Allowed Departments:
- "Roads & Bridges (PWD)"
- "Solid Waste Management"
- "Electrical & Street Lighting"
- "Water Supply & Sewerage Board"
- "Stormwater & Drainage Dept"
- "Traffic Management & Police"

Allowed Severity: "Low", "Medium", "High", "Critical"

Format strictly as:
{
  "detectedCategory": "string",
  "categoryId": "string",
  "severity": "string",
  "hazardScore": number (0-100),
  "safetyRisk": "1 concise sentence explaining danger to citizens or traffic",
  "recommendedDepartment": "string",
  "estimatedRepairDuration": "e.g. 12-24 Hours or 2-4 Days",
  "recommendedMaterials": ["item1", "item2", "item3"],
  "summary": "1-2 sentence objective diagnostic summary"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const text = response.text || '';
    // Strip markdown code fences if model enclosed it
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json({ ...parsed, source: 'gemini-ai' });
  } catch (err: any) {
    console.error('Gemini diagnose error, falling back:', err?.message || err);
    res.json({ ...fallbackResult, source: 'fallback-resilience' });
  }
});

// POST /api/ai/triage - Authority AI Dispatch Copilot: Work order & action plan
app.post('/api/ai/triage', async (req: Request, res: Response) => {
  const { complaint } = req.body;
  if (!complaint) {
    return res.status(400).json({ error: 'Complaint data required.' });
  }

  const fallbackTriage = {
    suggestedPriority: complaint.priority || 'High',
    crewSize: '3-4 Field Technicians',
    dispatchTimeframe: 'Immediate Dispatch within 4 hours',
    workOrderSteps: [
      'Site cordon: Deploy traffic safety barriers and warning cones.',
      'Acoustic or physical inspection to assess structural depth.',
      'Execute patch, replacement, or clearing operation per municipal standard.'
    ],
    requiredEquipment: ['Commercial utility truck', 'Safety gear (PPE)', 'Specialized tool kit'],
    officerDispatchRemarks: `Field inspection confirmed for ${complaint.category}. Priority allocated per hazard risk matrix.`
  };

  if (!ai) {
    return res.json({ ...fallbackTriage, source: 'heuristic-engine' });
  }

  try {
    const prompt = `You are the CivicFix AI Municipal Operations Assistant for Municipal Commissioners.
Analyze this ticket and generate an operational contractor work order and triage recommendation. Return JSON only:
Ticket ID: "${complaint.id}"
Category: "${complaint.category}"
Title: "${complaint.title}"
Description: "${complaint.description}"
Location: "${complaint.location?.address || 'Site'}"
Current Status: "${complaint.status}"

Format strictly as:
{
  "suggestedPriority": "Low" | "Medium" | "High" | "Critical",
  "crewSize": "string (e.g. 2-3 Technicians)",
  "dispatchTimeframe": "string (e.g. Within 6 hours / Next scheduled shift)",
  "workOrderSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "requiredEquipment": ["Equip 1", "Equip 2", "Equip 3"],
  "officerDispatchRemarks": "1 professional audit remark to log in the public timeline"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json({ ...parsed, source: 'gemini-ai' });
  } catch (err: any) {
    console.error('Gemini triage error:', err?.message || err);
    res.json({ ...fallbackTriage, source: 'fallback-resilience' });
  }
});

// POST /api/ai/citizen-response - Draft empathetic citizen update
app.post('/api/ai/citizen-response', async (req: Request, res: Response) => {
  const { complaint, newStatus, internalRemarks } = req.body;

  const fallbackMsg = `Dear ${complaint?.citizenName || 'Citizen'}, your report (#${complaint?.id || 'TICKET'}) for ${complaint?.category || 'civic issue'} has been updated to "${newStatus}". Our municipal team is actively executing repairs to restore full neighborhood safety.`;

  if (!ai) {
    return res.json({ draftedMessage: fallbackMsg, source: 'heuristic-engine' });
  }

  try {
    const prompt = `Draft a polite, transparent, and reassuring official SMS/Email update from the Municipal Grievance Desk to a citizen. Return JSON only:
Citizen Name: "${complaint?.citizenName || 'Citizen'}"
Complaint ID: "${complaint?.id}"
Category: "${complaint?.category}"
New Status: "${newStatus}"
Internal Officer Notes: "${internalRemarks || 'Standard procedure underway'}"

Format strictly as:
{
  "draftedMessage": "Concise 2-3 sentence update message suitable for citizen notification."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json({ ...parsed, source: 'gemini-ai' });
  } catch (err: any) {
    res.json({ draftedMessage: fallbackMsg, source: 'fallback-resilience' });
  }
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serving Setup
// -----------------------------------------------------------------------------
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicFix Server] Running on http://localhost:${PORT} (Node ${process.version})`);
  });
}

setupServer().catch((err) => {
  console.error('[CivicFix Server] Failed to start:', err);
  process.exit(1);
});
