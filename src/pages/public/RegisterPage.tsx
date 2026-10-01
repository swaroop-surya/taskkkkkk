import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });

      setSuccess('Account created successfully! Logging you in with Member role...');

      setTimeout(async () => {
        try {
          const user = await login(formData.username, formData.password);
          navigate(user.is_staff ? '/admin' : '/user');
        } catch {
          navigate('/login');
        }
      }, 1500);
    } catch (err: any) {
      const resp = err.response?.data;
      if (resp) {
        if (resp.username) setError(`Username: ${resp.username.join(' ')}`);
        else if (resp.email) setError(`Email: ${resp.email.join(' ')}`);
        else if (resp.detail) setError(resp.detail);
        else setError('Registration failed. Please check the form.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F0F3F5]">
      <div className="max-w-md w-full space-y-6 bg-[#FDFDFE] p-8 rounded-3xl border border-[#D6D9DF] shadow-md">
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-[#EBF3F1] text-[#3D766D] mb-1 border border-[#D6D9DF]">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1E252B]">
            Create your account
          </h2>
          <p className="text-xs text-[#8F9192]">
            Default role: <span className="font-semibold text-[#3D766D]">Member (is_staff=False)</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-[#EBF3F1] border border-[#C3DAD5] rounded-xl text-xs text-[#2D5851] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3D766D] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Jane"
                className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Smith"
                className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#8F9192]" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="janesmith"
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#8F9192]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jane@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-[#8F9192]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E252B] mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-[#8F9192]" />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F3F5] rounded-xl text-sm border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] text-[#1E252B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-sm shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Creating Member Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-[#8F9192]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#3D766D] hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
