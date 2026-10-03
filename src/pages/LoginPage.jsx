import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, ArrowRight, UserCheck, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login, loginAsDemoCitizen, loginAsDemoAuthority } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your registered email or mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your account password.');
      return;
    }

    const user = login(identifier, password);
    if (user.role === 'authority') {
      navigate('/authority/dashboard');
    } else {
      navigate('/citizen/dashboard');
    }
  };

  const handleDemoCitizen = () => {
    loginAsDemoCitizen();
    navigate('/citizen/dashboard');
  };

  const handleDemoAuthority = () => {
    loginAsDemoAuthority();
    navigate('/authority/dashboard');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setForgotSent(true);
      setTimeout(() => {
        setForgotSent(false);
        setForgotModal(false);
        setForgotEmail('');
      }, 2500);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to CivicFix
          </h2>
          <p className="text-sm text-slate-500">
            Sign in to report municipal grievances or manage department resolution
          </p>
        </div>

        {/* Demo Fast-Track Action Box (Crucial for Hackathon Evaluation!) */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
            <span>🚀 Quick Hackathon Demo Logins:</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">1-Click</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDemoCitizen}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-50 border border-blue-200 text-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-all hover:border-blue-400 active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Citizen</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAuthority}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-50 border border-indigo-200 text-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-all hover:border-indigo-400 active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Demo Authority</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email or Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@email.com or 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <span>Login to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">
                Register as Citizen
              </Link>
            </p>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reset Your Password</h3>
            <p className="text-xs text-slate-500">
              Enter your registered email address and we'll send a secure password reset link.
            </p>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Reset link sent! Please check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
