import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { User as UserIcon, Lock, Mail, ArrowRight, ArrowLeft, LogIn, UserPlus, ShieldCheck, X } from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onCancel?: () => void;
  onLogin: (user: User) => void;
  onOpenAdminLogin?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onCancel, onOpenAdminLogin }) => {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const registerBtnRef = useRef<HTMLButtonElement>(null);
  const loginBtnRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign In state - empty by default
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');

  useEffect(() => {
    const registerBtn = registerBtnRef.current;
    const loginBtn = loginBtnRef.current;

    const handleRegisterClick = () => setIsActive(true);
    const handleLoginClick = () => setIsActive(false);

    registerBtn?.addEventListener('click', handleRegisterClick);
    loginBtn?.addEventListener('click', handleLoginClick);

    return () => {
      registerBtn?.removeEventListener('click', handleRegisterClick);
      loginBtn?.removeEventListener('click', handleLoginClick);
    };
  }, []);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = loginUsername.trim();
    const cleanPassword = loginPassword.trim();
    if (!cleanUsername || !cleanPassword) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login({ username: cleanUsername, password: cleanPassword });
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = regUsername.trim();
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();
    const cleanFullName = regFullName.trim();
    
    if (!cleanUsername || !cleanEmail || !cleanPassword || !cleanFullName) {
      setError('Please fill in all fields.');
      return;
    }
    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.register({
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        fullName: cleanFullName,
        role: 'viewer',
      } as any);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center items-center p-4">
      {/* Click outside backdrop to cancel */}
      <div className="fixed inset-0" onClick={onCancel} />
      
      <div className="relative z-10">
        {onCancel && (
          <button
            onClick={onCancel}
            aria-label="Close login dialog"
            className="absolute -top-12 right-0 md:-top-4 md:-right-12 p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full z-50 shadow-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Sliding Curved Container */}
        <div
          ref={containerRef}
          className={`container auth-curved-container shadow-2xl ${isActive ? 'active' : ''}`}
        >
        {/* ===================================================
            LOGIN FORM BOX (Initially on Right side)
            =================================================== */}
        <div className="form-box login">
          <form onSubmit={handleSignInSubmit}>
            <h1>Sign In</h1>
            {error && !isActive && (
              <div className="mb-3 p-2 text-xs rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}
            <div className="input-box">
              <input
                type="text"
                placeholder="Username or Email"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
              <UserIcon className="input-icon w-5 h-5" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Lock className="input-icon w-5 h-5" />
            </div>
            
            <button type="submit" disabled={loading} className="btn mt-4">
              <LogIn className="w-4 h-4 mr-1.5" />
              <span>{loading ? 'Logging in...' : 'Login'}</span>
            </button>

            {onOpenAdminLogin && (
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 active:scale-[0.98] transition-all font-semibold cursor-pointer"
                  title="Admin Access Panel"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorized Personnel Only</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ===================================================
            REGISTRATION FORM BOX (Becomes visible when active)
            =================================================== */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            {error && isActive && (
              <div className="mb-3 p-2 text-xs rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}
            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
              />
              <UserIcon className="input-icon w-5 h-5" />
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <Mail className="input-icon w-5 h-5" />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
              />
              <UserIcon className="input-icon w-5 h-5" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <Lock className="input-icon w-5 h-5" />
            </div>
            
            <button type="submit" disabled={loading} className="btn mt-4">
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>{loading ? 'Creating...' : 'Register'}</span>
            </button>
          </form>
        </div>

        {/* ===================================================
            CURVED SLIDING OVERLAY (toggle-box)
            =================================================== */}
        <div className="toggle-box">
          {/* Left Toggle Panel (Visible when NOT active) */}
          <div className="toggle-panel toggle-left">
            <h1>Start Connecting!</h1>
            <p>Every opportunity begins with a connection. Build your private CRM today.</p>
            <button ref={registerBtnRef} type="button" className="btn register-btn">
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Toggle Panel (Visible when ACTIVE) */}
          <div className="toggle-panel toggle-right">
            <h1>Glad You're Back!</h1>
            <p>Your network is waiting. Sign in to seamlessly manage your valuable connections.</p>
            <button ref={loginBtnRef} type="button" className="btn login-btn">
              <ArrowLeft className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
