import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  Map, 
  LayoutDashboard, 
  FileText, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Building2, 
  Compass, 
  Bell, 
  Repeat
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAuthority, isCitizen, logout, switchRole, notificationCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleRoleToggle = () => {
    if (isAuthority) {
      switchRole('citizen');
      navigate('/citizen/dashboard');
    } else {
      switchRole('authority');
      navigate('/authority/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  CivicFix
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  GovTech
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Chinmay Hackathon
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Report. Track. Resolve.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            {isCitizen && (
              <>
                <Link
                  to="/citizen/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/citizen/dashboard') ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/complaints"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/complaints') ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Complaints
                </Link>
              </>
            )}

            {isAuthority && (
              <>
                <Link
                  to="/authority/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/authority/dashboard') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Authority Portal
                </Link>
                <Link
                  to="/authority/complaints"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/authority/complaints') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Issue Triage
                </Link>
                <Link
                  to="/authority/map"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/authority/map') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  City Live Map
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Role Switcher Toggle */}
            <button
              type="button"
              onClick={handleRoleToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 hover:border-slate-400 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 transition-colors shadow-2xs"
              title="Toggle between Citizen and Municipal Authority views"
            >
              <Repeat className="w-3.5 h-3.5 text-blue-600" />
              <span>Role: <strong className="text-slate-900">{isAuthority ? 'Authority' : 'Citizen'}</strong></span>
            </button>

            {/* + Report Issue CTA */}
            <Link
              to="/report"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/20">
                    {user.avatar || 'CF'}
                  </div>
                  <span className="text-xs font-semibold max-w-[120px] truncate">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to={isAuthority ? '/authority/dashboard' : '/citizen/dashboard'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        to="/complaints"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Complaints List</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleRoleToggle}
              className="text-[11px] font-bold px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-700"
            >
              {isAuthority ? 'Admin' : 'Citizen'}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
            {isCitizen && (
              <>
                <Link
                  to="/citizen/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Citizen Dashboard
                </Link>
                <Link
                  to="/complaints"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Complaints
                </Link>
              </>
            )}
            {isAuthority && (
              <>
                <Link
                  to="/authority/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Authority Portal
                </Link>
                <Link
                  to="/authority/complaints"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Issue Triage
                </Link>
                <Link
                  to="/authority/map"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  City Live Map
                </Link>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/report"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report a Civic Issue</span>
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate('/login');
                }}
                className="w-full text-center py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-slate-100 rounded-lg text-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
