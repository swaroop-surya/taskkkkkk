import React, { useState } from 'react';
import { Mail, Phone, Key, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/common/UserAvatar';

export const UserProfile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const res = await api.patch('/auth/profile/', profileForm);
      updateUser(res.data);
      setProfileMessage('Profile updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch {
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      await api.post('/auth/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMessage('Password changed successfully.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.old_password?.[0] || 'Unable to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E252B]">Member Profile</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Manage your personal contact details, role overview, and security password.
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Overview */}
        <div className="space-y-6">
          <div className="bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs text-center space-y-4">
            <div className="flex justify-center">
              <UserAvatar
                name={user?.full_name || user?.username}
                username={user?.username}
                isStaff={false}
                size="xl"
              />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#1E252B]">
                {user?.full_name || user?.username}
              </h3>
              <p className="text-xs text-[#8F9192]">@{user?.username}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] text-[11px] font-semibold">
                <span>Member (is_staff=False)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D6D9DF] text-left text-xs space-y-2 text-[#8F9192]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#3D766D]" />
                <span className="truncate text-[#1E252B]">{user?.email}</span>
              </div>
              <div className="text-[11px]">
                Registered: {new Date(user?.date_joined || '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Details & Password */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#1E252B]">Profile Information</h3>

            {profileMessage && (
              <div className="p-3 bg-[#EBF3F1] text-[#2D5851] border border-[#C3DAD5] rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span>{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio / Notes</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share a short bio about yourself..."
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-4 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#1E252B] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#3D766D]" />
              <span>Change Security Password</span>
            </h3>

            {passwordError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordMessage && (
              <div className="p-3 bg-[#EBF3F1] text-[#2D5851] border border-[#C3DAD5] rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span>{passwordMessage}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.old_password}
                  onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="py-2.5 px-4 rounded-xl bg-[#1E252B] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
