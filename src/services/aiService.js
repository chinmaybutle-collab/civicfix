// Client-side service connecting to Server-side Gemini AI endpoints

export const aiService = {
  // Citizen AI Assistant: Auto-classify & assess hazard
  async diagnoseIssue({ description, categoryHint, locationHint }) {
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, categoryHint, locationHint })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('AI diagnose call failed, using client fallback:', err);
      return {
        detectedCategory: categoryHint || 'Pothole',
        categoryId: (categoryHint || 'pothole').toLowerCase().replace(/\s+/g, '_'),
        severity: 'High',
        hazardScore: 75,
        safetyRisk: 'Presents road hazard to pedestrians and vehicles during transit.',
        recommendedDepartment: 'Roads & Bridges (PWD)',
        estimatedRepairDuration: '24-48 Hours',
        recommendedMaterials: ['Cold mix asphalt patch', 'Plate compactor', 'Warning traffic cones'],
        summary: 'Reported civic issue requires on-site inspection and surface restoration.',
        source: 'client-fallback'
      };
    }
  },

  // Authority AI Dispatch Copilot: Work order & action plan
  async triageComplaint(complaint) {
    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('AI triage call failed, using client fallback:', err);
      return {
        suggestedPriority: complaint.priority || 'High',
        crewSize: '3 Field Technicians',
        dispatchTimeframe: 'Within 6 hours',
        workOrderSteps: [
          'Safety perimeter cordon with warning cones.',
          'Physical inspection of underlying structure.',
          'Execute repair per municipal engineering code.'
        ],
        requiredEquipment: ['Standard utility crew van', 'Protective gear (PPE)', 'Specialized tool kit'],
        officerDispatchRemarks: `Field inspection mobilized for ${complaint.category}.`,
        source: 'client-fallback'
      };
    }
  },

  // Authority AI Response Drafter: Empathy & transparency update
  async draftCitizenResponse({ complaint, newStatus, internalRemarks }) {
    try {
      const res = await fetch('/api/ai/citizen-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint, newStatus, internalRemarks })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('AI citizen-response call failed, using client fallback:', err);
      return {
        draftedMessage: `Dear ${complaint?.citizenName || 'Resident'}, your report (#${complaint?.id || 'TICKET'}) for ${complaint?.category || 'civic issue'} has been updated to "${newStatus}". Our municipal team is executing repairs per city safety guidelines.`,
        source: 'client-fallback'
      };
    }
  }
};
