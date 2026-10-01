import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Key, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      if (user.is_staff) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F0F3F5]">
      <div className="max-w-md w-full space-y-6 bg-[#FDFDFE] p-8 rounded-3xl border border-[#D6D9DF] shadow-md">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-[#EBF3F1] text-[#3D766D] mb-1 border border-[#D6D9DF]">
            <LogIn className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1E252B]">
            Sign in to your account
          </h2>
          <p className="text-xs text-[#8F9192]">
            Single portal with automatic role detection (<code className="text-[#3D766D] font-mono">is_staff</code>)
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="bg-[#F0F3F5] p-3 rounded-2xl border border-[#D6D9DF] space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8F9192] text-center">
            One-Click Test Autofill
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('admin', 'admin123')}
              className="py-2 px-2.5 rounded-xl bg-[#FDFDFE] hover:bg-[#EBF3F1] text-[#3D766D] font-semibold border border-[#D6D9DF] transition-colors text-center cursor-pointer shadow-2xs"
            >
              <div className="font-bold flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-[#3D766D]" /> Admin (Eleanor)
              </div>
              <div className="text-[10px] text-[#8F9192] mt-0.5">admin / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => autofill('john_doe', 'user123')}
              className="py-2 px-2.5 rounded-xl bg-[#FDFDFE] hover:bg-[#EBF3F1] text-[#1E252B] font-semibold border border-[#D6D9DF] transition-colors text-center cursor-pointer shadow-2xs"
            >
              <div className="font-bold flex items-center justify-center gap-1">
                <User className="w-3 h-3 text-[#3D766D]" /> Member (John Doe)
              </div>
              <div className="text-[10px] text-[#8F9192] mt-0.5">john_doe / user123</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#8F9192]" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username or email address"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:outline-hidden focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#1E252B]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#3D766D] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-[#8F9192]" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:outline-hidden focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-sm shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Validating SimpleJWT credentials...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#8F9192]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#3D766D] hover:underline">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
};
