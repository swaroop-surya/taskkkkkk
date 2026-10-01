import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password/', {
        email,
        token: token || 'RESET-DEMO',
        new_password: newPassword,
      });
      setSuccess('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Reset failed. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#FDFDFE] p-8 rounded-3xl border border-[#D6D9DF] shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] mb-1">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E252B] tracking-tight">Set New Password</h2>
          <p className="text-xs text-[#8F9192]">
            Enter your email and define your updated login credentials
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-[#EBF3F1] border border-[#D6D9DF] text-[#2D5851] rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3D766D] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Reset Token (Optional for demo)
            </label>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="e.g. RESET-2-DEMO"
              className="w-full px-4 py-2 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              className="w-full px-4 py-2 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
              className="w-full px-4 py-2 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-sm shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#3D766D] font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
