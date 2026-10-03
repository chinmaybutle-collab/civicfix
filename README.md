# CivicFix — Smart Civic Issue Reporting & Tracking Platform

> **"Report. Track. Resolve."**  
> A full-stack, AI-powered civic governance and municipal grievance redressal web application.

CivicFix connects citizen voices directly to municipal authorities. Residents can report local hazards (potholes, garbage, broken streetlights, water pipeline bursts, drainage blockages) with GPS pin-pointing and photo evidence, while municipal officers manage automated triage, crew dispatches, and work order tracking.

---

## Key Features

### 1. Citizen Portal
- **Rapid Issue Reporting**: Select from 9 civic categories, pin location on an interactive OpenStreetMap Leaflet map, auto-detect GPS coordinates, and attach photographic evidence.
- **Gemini AI Auto-Diagnosis**: AI automatically classifies the issue, estimates hazard risk (0–100 score), determines vehicular/pedestrian safety risk, recommends the responsible department, and predicts repair turnaround (SLA).
- **Public & Private Tracking**: Track complaint progression in real-time through an interactive 5-stage timeline (*Reported &rarr; Verified &rarr; Assigned &rarr; In Progress &rarr; Resolved*).
- **Resident Feedback**: Star-rating and review submission upon ticket resolution.

### 2. Municipal Authority Command Center
- **Executive Operations Dashboard**: High-level KPI metrics, active triage queues, 7-day complaint intake trends, and category distribution charts powered by **Recharts**.
- **Geographic GIS Map**: City-wide interactive Leaflet map displaying active grievances color-coded by urgency and status.
- **AI Dispatch & Work Order Copilot**: Generates step-by-step contractor repair work orders, crew size estimates, and equipment/material checklists using Gemini.
- **Automated Citizen Update Drafter**: AI creates transparent, empathetic municipal notifications for status updates.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React icons, Recharts, Leaflet / React-Leaflet
- **Backend**: Node.js, Express REST API, TypeScript (`tsx`)
- **Database**: File-backed persistent database (`data/database.json`) with atomic synchronization
- **AI Intelligence**: Google Gemini API (`gemini-3.8-flash`) via `@google/genai` SDK

---

## Quick Start (Local Setup)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [Git](https://git-scm.com/)

### 2. Installation
Clone your repository and install dependencies:
```bash
git clone https://github.com/<your-username>/civicfix.git
cd civicfix
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key (optional for basic features; full AI diagnosis will use local fallback if omitted):
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 4. Run the Full-Stack Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Project Structure

```text
├── data/
│   └── database.json          # Persistent complaint database
├── src/
│   ├── components/            # UI components (Navbar, Footer, LeafletMap, Badges, Timeline)
│   ├── context/               # AuthContext (Role switcher: Citizen / Authority)
│   ├── pages/                 # Full pages (Landing, Report, Dashboard, Triage, GIS Map)
│   ├── services/              # API & AI client bridge services
│   ├── App.jsx                # Main client router
│   ├── main.jsx               # React entry point
│   └── index.css              # Global Tailwind CSS styling
├── server.ts                  # Express REST API & Gemini AI endpoints
├── package.json               # Dependencies and scripts
└── vite.config.ts             # Vite configuration
```

---

## REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & AI configuration status |
| `GET` | `/api/complaints` | Filterable complaints list (status, category, ward, search) |
| `GET` | `/api/complaints/:id` | Detailed complaint audit history |
| `POST` | `/api/complaints` | Submit new civic grievance |
| `PATCH` | `/api/complaints/:id/status` | Update workflow status & audit log |
| `PATCH` | `/api/complaints/:id/assign` | Assign municipal department & crew |
| `POST` | `/api/complaints/:id/feedback` | Citizen resolution rating & review |
| `GET` | `/api/analytics` | Aggregated dashboard analytics & charts |
| `POST` | `/api/ai/diagnose` | Gemini AI hazard auto-diagnosis & classification |
| `POST` | `/api/ai/triage` | Gemini AI work order & contractor plan generator |
| `POST` | `/api/ai/citizen-response` | Gemini AI citizen update drafter |
