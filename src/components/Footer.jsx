import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">CivicFix</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Smart Civic Issue Reporting &amp; Tracking Platform. Connecting citizen voices directly to municipal field officers for transparent, accountable neighborhood governance.
            </p>
            <div className="flex items-center gap-4 text-slate-300 text-xs pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>1800-CIVIC-FIX</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>helpdesk@civicfix.gov</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Citizens
            </h4>
            <ul className="space-y-2">
              <li><Link to="/report" className="hover:text-white transition-colors">Report an Issue</Link></li>
              <li><Link to="/complaints" className="hover:text-white transition-colors">Track Status</Link></li>
              <li><Link to="/citizen/dashboard" className="hover:text-white transition-colors">Citizen Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Citizen Registration</Link></li>
            </ul>
          </div>

          {/* Municipal Authorities */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Authorities
            </h4>
            <ul className="space-y-2">
              <li><Link to="/authority/dashboard" className="hover:text-white transition-colors">Command Center</Link></li>
              <li><Link to="/authority/complaints" className="hover:text-white transition-colors">Issue Triage &amp; Assign</Link></li>
              <li><Link to="/authority/map" className="hover:text-white transition-colors">Geographic GIS Map</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Officer Sign In</Link></li>
            </ul>
          </div>

          {/* Civic Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Civic Services
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Potholes &amp; Road Craters</li>
              <li>Solid Waste &amp; Garbage</li>
              <li>Streetlights &amp; Dark Spots</li>
              <li>Water Leakage &amp; Drainage</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CivicFix Platform. Smart Municipal Infrastructure Initiative.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">Citizen Charter</a>
            <a href="#" className="hover:text-slate-400">Privacy &amp; Data Ethics</a>
            <a href="#" className="hover:text-slate-400">SLA Guidelines</a>
            <span className="text-slate-600">Built for Smart City Hackathon</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
