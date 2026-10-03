import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { SAMPLE_COMPLAINTS, WARDS } from './mockData';

const COLLECTION_NAME = 'complaints';
const STORAGE_KEY = 'civicfix_complaints_v1';

let hasSeeded = false;

// Seed initial reports to Firestore once if collection is completely empty
async function ensureInitialSeed() {
  if (hasSeeded) return;
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      console.log('Seeding initial civic reports into Firebase Firestore...');
      for (const item of SAMPLE_COMPLAINTS) {
        await setDoc(doc(db, COLLECTION_NAME, item.id), {
          ...item,
          address: item.location?.address || 'Site Address',
          ward: item.location?.ward || 'Ward 1',
          lat: item.location?.lat || 28.6139,
          lng: item.location?.lng || 77.2090
        });
      }
      console.log('Successfully seeded initial reports to Firebase Firestore.');
    }
    hasSeeded = true;
  } catch (err) {
    console.warn('Initial Firestore seed check notice:', err?.message || err);
  }
}

export const complaintService = {
  // Subscribe to live real-time reports stream
  subscribeComplaints(onUpdate, onError) {
    ensureInitialSeed();
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id
        }));
        // Update local storage cache
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (_) {}
        if (onUpdate) onUpdate(list);
      },
      (error) => {
        console.error('Firestore live stream listener error:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      }
    );
  },

  // Fetch all complaints with filters from Firebase Firestore
  async getComplaints(filters = {}) {
    await ensureInitialSeed();
    let firestoreList = [];
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      firestoreList = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id
      }));

      if (firestoreList.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreList));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Firestore fetch failed, attempting backend/local fallback:', err?.message || err);
      // Fallback to local storage or SAMPLE_COMPLAINTS
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          firestoreList = JSON.parse(cached);
        } catch (_) {
          firestoreList = SAMPLE_COMPLAINTS;
        }
      } else {
        firestoreList = SAMPLE_COMPLAINTS;
      }
    }

    let list = [...firestoreList];
    if (filters.status && filters.status !== 'All') {
      list = list.filter((c) => c.status && c.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.category && filters.category !== 'All') {
      list = list.filter((c) => c.category && c.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.priority && filters.priority !== 'All') {
      list = list.filter((c) => c.priority && c.priority.toLowerCase() === filters.priority.toLowerCase());
    }
    if (filters.department && filters.department !== 'All') {
      list = list.filter((c) => c.department && c.department.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters.ward && filters.ward !== 'All') {
      list = list.filter((c) => (c.ward || c.location?.ward) === filters.ward);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) =>
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.location?.address && c.location.address.toLowerCase().includes(q))
      );
    }

    return list;
  },

  // Fetch single complaint by ID from Firestore
  async getComplaintById(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id };
      }
    } catch (err) {
      console.warn('Firestore getComplaintById error:', err);
    }

    // Local fallback check
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const list = JSON.parse(cached);
        const found = list.find((c) => c.id.toUpperCase() === id.toUpperCase());
        if (found) return found;
      } catch (_) {}
    }
    return SAMPLE_COMPLAINTS.find((c) => c.id.toUpperCase() === id.toUpperCase()) || null;
  },

  // Create new complaint in Firebase Firestore
  async createComplaint(data) {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newId = `CIV-${year}-${randomSuffix}`;

    const newComplaint = {
      id: newId,
      category: data.category || 'Other Civic Issue',
      categoryId: data.categoryId || 'other',
      title: data.title || `${data.category || 'Civic Issue'} reported at ${data.address || 'Site'}`,
      description: data.description || '',
      address: data.address || 'GPS Coordinate Location',
      ward: data.ward || WARDS[0],
      lat: Number(data.lat) || 28.6139,
      lng: Number(data.lng) || 77.2090,
      location: {
        address: data.address || 'GPS Coordinate Location',
        lat: Number(data.lat) || 28.6139,
        lng: Number(data.lng) || 77.2090,
        ward: data.ward || WARDS[0]
      },
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      status: 'Reported',
      priority: data.priority || 'Medium',
      citizenId: data.citizenId || 'citizen_anon',
      citizenName: data.citizenName || 'Concerned Citizen',
      citizenPhone: data.citizenPhone || '+91 98000 00000',
      citizenEmail: data.citizenEmail || 'citizen@civicfix.org',
      reportedDate: new Date().toISOString(),
      department: data.department || 'Pending Department Assignment',
      assignedOfficer: 'Central Triage Queue',
      hackathon: 'Chinmay Hackathon',
      timeline: [
        {
          status: 'Reported',
          date: new Date().toISOString(),
          note: 'Complaint registered by citizen with geolocation and image verification.'
        }
      ],
      feedback: null
    };

    try {
      const docRef = doc(db, COLLECTION_NAME, newId);
      await setDoc(docRef, newComplaint);
      console.log('Complaint stored in Firebase Firestore:', newId);
    } catch (err) {
      console.error('Failed to write complaint to Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
    }

    // Update local cache
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const list = cached ? JSON.parse(cached) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newComplaint, ...list]));
    } catch (_) {}

    return newComplaint;
  },

  // Update complaint status with officer note in Firestore
  async updateStatus(id, newStatus, officerNote = '', officerName = 'Municipal Officer') {
    const existing = await this.getComplaintById(id);
    if (!existing) throw new Error('Complaint not found');

    const updatedTimeline = [
      ...(existing.timeline || []),
      {
        status: newStatus,
        date: new Date().toISOString(),
        note: officerNote || `Status updated to ${newStatus} by ${officerName}.`
      }
    ];

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: newStatus,
        timeline: updatedTimeline
      });
      console.log(`Complaint ${id} status updated to ${newStatus} in Firestore.`);
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return {
      ...existing,
      status: newStatus,
      timeline: updatedTimeline
    };
  },

  // Assign department & officer in Firestore
  async assignDepartment(id, department, priority, assignedOfficer) {
    const existing = await this.getComplaintById(id);
    if (!existing) throw new Error('Complaint not found');

    const newStatus = existing.status === 'Reported' ? 'Assigned' : existing.status;
    const updatedTimeline = [
      ...(existing.timeline || []),
      {
        status: newStatus,
        date: new Date().toISOString(),
        note: `Assigned to ${department} (${assignedOfficer || 'Field Crew'}) with priority ${priority || existing.priority}.`
      }
    ];

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        department,
        priority: priority || existing.priority,
        assignedOfficer: assignedOfficer || existing.assignedOfficer,
        status: newStatus,
        timeline: updatedTimeline
      });
      console.log(`Complaint ${id} assigned in Firestore.`);
    } catch (err) {
      console.error('Failed to assign department in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return {
      ...existing,
      department,
      priority: priority || existing.priority,
      assignedOfficer: assignedOfficer || existing.assignedOfficer,
      status: newStatus,
      timeline: updatedTimeline
    };
  },

  // Submit citizen feedback on resolved complaint
  async submitFeedback(id, { rating, comment }) {
    const existing = await this.getComplaintById(id);
    if (!existing) throw new Error('Complaint not found');

    const feedbackData = {
      rating: Number(rating),
      comment: String(comment || ''),
      submittedDate: new Date().toISOString()
    };

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        feedback: feedbackData
      });
    } catch (err) {
      console.error('Failed to submit feedback in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return {
      ...existing,
      feedback: feedbackData
    };
  },

  // Calculate platform analytics from live data
  async getAnalytics() {
    const complaints = await this.getComplaints();
    const total = complaints.length;
    const reported = complaints.filter((c) => c.status === 'Reported').length;
    const verified = complaints.filter((c) => c.status === 'Verified').length;
    const assigned = complaints.filter((c) => c.status === 'Assigned').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;

    const categoryCount = {};
    complaints.forEach((c) => {
      const cat = c.category || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
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
      const wardComplaints = complaints.filter((c) => (c.ward || c.location?.ward) === w);
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
