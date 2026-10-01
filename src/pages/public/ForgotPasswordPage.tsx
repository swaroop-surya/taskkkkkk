import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password/', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || 'Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#FDFDFE] p-8 rounded-3xl border border-[#D6D9DF] shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] mb-1">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E252B] tracking-tight">Reset Password</h2>
          <p className="text-xs text-[#8F9192]">
            Enter your account email to receive reset instructions via Django Console SMTP
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#EBF3F1] border border-[#D6D9DF] rounded-2xl text-[#2D5851] text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#3D766D]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reset Instructions Sent!</span>
              </div>
              <p>
                If an account exists for <span className="font-semibold">{email}</span>, a reset email has been dispatched via Django console backend.
              </p>
              <p className="text-[11px] text-[#8F9192]">
                You can open the bottom-right <strong>"Django Console SMTP &amp; Signals"</strong> drawer to inspect the email token!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/reset-password"
                className="w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] transition-colors"
              >
                Proceed to Enter New Password
              </Link>
              <Link
                to="/login"
                className="w-full py-2.5 text-center text-xs font-semibold text-[#8F9192] hover:text-[#1E252B] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="registered@example.com"
                className="w-full px-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-sm shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? 'Sending Instructions...' : 'Send Password Reset Email'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#3D766D] font-semibold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
