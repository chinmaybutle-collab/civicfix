import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Citizen pages
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import ComplaintHistoryPage from './pages/ComplaintHistoryPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';

// Authority pages
import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityComplaintsPage from './pages/AuthorityComplaintsPage';
import AuthorityMapView from './pages/AuthorityMapView';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white pb-14 md:pb-0">
      <ScrollToTop />
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen Routes */}
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/complaints" element={<ComplaintHistoryPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />

          {/* Authority Routes */}
          <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
          <Route path="/authority/complaints" element={<AuthorityComplaintsPage />} />
          <Route path="/authority/map" element={<AuthorityMapView />} />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav />
    </div>
  );
}
