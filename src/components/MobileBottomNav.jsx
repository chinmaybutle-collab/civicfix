import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, FileText, Map, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated, isAuthority } = useAuth();
  const path = location.pathname;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-lg flex items-center justify-around">
      <Link
        to="/"
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
          path === '/' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </Link>

      <Link
        to={isAuthority ? '/authority/dashboard' : '/citizen/dashboard'}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
          path.includes('dashboard') ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>{isAuthority ? 'Admin' : 'Dashboard'}</span>
      </Link>

      {/* Center Elevated Action Button */}
      <Link
        to="/report"
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-transform border-2 border-white">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-blue-700 mt-0.5">Report</span>
      </Link>

      <Link
        to={isAuthority ? '/authority/map' : '/complaints'}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
          path === '/complaints' || path === '/authority/map' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        {isAuthority ? <Map className="w-5 h-5 mb-0.5" /> : <FileText className="w-5 h-5 mb-0.5" />}
        <span>{isAuthority ? 'Live Map' : 'Track'}</span>
      </Link>

      <Link
        to={isAuthenticated ? (isAuthority ? '/authority/dashboard' : '/citizen/dashboard') : '/login'}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
          path === '/login' || path === '/register' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>{isAuthenticated ? 'Account' : 'Login'}</span>
      </Link>
    </div>
  );
}
