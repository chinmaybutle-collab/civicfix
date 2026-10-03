import { SAMPLE_COMPLAINTS, ISSUE_CATEGORIES, DEPARTMENTS, WARDS } from './mockData';

const STORAGE_KEY = 'civicfix_complaints_v1';

function getLocalDB() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
    return SAMPLE_COMPLAINTS;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    return SAMPLE_COMPLAINTS;
  }
}

export const complaintService = {
  // Fetch all complaints with filters from Express backend
  async getComplaints(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') params.set('status', filters.status);
      if (filters.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters.priority && filters.priority !== 'All') params.set('priority', filters.priority);
      if (filters.department && filters.department !== 'All') params.set('department', filters.department);
      if (filters.ward && filters.ward !== 'All') params.set('ward', filters.ward);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Sync local cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Backend fetch failed, using local cache:', err);
    }

    // Local fallback
    let list = getLocalDB();
    if (filters.status && filters.status !== 'All') {
      list = list.filter((c) => c.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.category && filters.category !== 'All') {
      list = list.filter((c) => c.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.priority && filters.priority !== 'All') {
      list = list.filter((c) => c.priority.toLowerCase() === filters.priority.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.location?.address && c.location.address.toLowerCase().includes(q))
      );
    }
    return list;
  },

  // Fetch single complaint by ID
  async getComplaintById(id) {
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend getComplaintById failed, using local cache:', err);
    }

    const list = getLocalDB();
    return list.find((c) => c.id.toUpperCase() === id.toUpperCase()) || null;
  },

  // Create new complaint
  async createComplaint(data) {
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const created = await res.json();
        const list = getLocalDB();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...list]));
        return created;
      }
    } catch (err) {
      console.warn('Backend createComplaint failed, using local fallback:', err);
    }

    // Fallback ID generation
    const list = getLocalDB();
    const newId = `CIV-${new Date().getFullYear()}-${String(list.length + 101).padStart(5, '0')}`;
    const newComplaint = {
      id: newId,
      category: data.category || 'Other Civic Issue',
      categoryId: data.categoryId || 'other',
      title: data.title || `${data.category} reported at ${data.address || 'Site'}`,
      description: data.description || '',
      location: {
        address: data.address || 'GPS Location',
        lat: data.lat || 28.6139,
        lng: data.lng || 77.2090,
        ward: data.ward || WARDS[0]
      },
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      status: 'Reported',
      priority: data.priority || 'Medium',
      citizenName: data.citizenName || 'Concerned Citizen',
      citizenPhone: data.citizenPhone || '+91 98000 00000',
      citizenEmail: data.citizenEmail || 'citizen@civicfix.org',
      reportedDate: new Date().toISOString(),
      department: data.department || 'Pending Department Assignment',
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newComplaint, ...list]));
    return newComplaint;
  },

  // Update status with officer note
  async updateStatus(id, newStatus, officerNote = '', officerName = 'Municipal Officer') {
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: officerNote, officerName })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend updateStatus failed, using local update:', err);
    }

    const list = getLocalDB();
    const index = list.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
    if (index === -1) throw new Error('Complaint not found');

    const complaint = list[index];
    complaint.status = newStatus;
    if (!complaint.timeline) complaint.timeline = [];
    complaint.timeline.push({
      status: newStatus,
      date: new Date().toISOString(),
      note: officerNote || `Status updated to ${newStatus} by ${officerName}.`
    });

    list[index] = complaint;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return complaint;
  },

  // Assign department and officer
  async assignDepartment(id, department, priority, assignedOfficer) {
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department, priority, assignedOfficer })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend assignDepartment failed, using local fallback:', err);
    }

    const list = getLocalDB();
    const index = list.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
    if (index === -1) throw new Error('Complaint not found');

    const complaint = list[index];
    complaint.department = department;
    if (priority) complaint.priority = priority;
    if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;
    if (complaint.status === 'Reported') {
      complaint.status = 'Assigned';
    }

    complaint.timeline.push({
      status: complaint.status,
      date: new Date().toISOString(),
      note: `Assigned to ${department} (${assignedOfficer || 'Field Crew'}) with priority ${priority || complaint.priority}.`
    });

    list[index] = complaint;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return complaint;
  },

  // Submit feedback on resolved complaint
  async submitFeedback(id, { rating, comment }) {
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend submitFeedback failed, using local fallback:', err);
    }

    const list = getLocalDB();
    const index = list.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
    if (index === -1) throw new Error('Complaint not found');

    list[index].feedback = {
      rating,
      comment,
      submittedDate: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list[index];
  },

  // Calculate platform analytics
  async getAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend getAnalytics failed, using local calculation:', err);
    }

    const complaints = getLocalDB();
    const total = complaints.length;
    const reported = complaints.filter((c) => c.status === 'Reported').length;
    const verified = complaints.filter((c) => c.status === 'Verified').length;
    const assigned = complaints.filter((c) => c.status === 'Assigned').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;

    const categoryCount = {};
    complaints.forEach((c) => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

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

    return {
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
    };
  }
};
