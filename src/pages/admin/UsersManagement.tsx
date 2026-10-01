import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import api from '../../api/axios';
import { User } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Form states
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    is_active: true,
    phone: '',
    bio: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/auth/users/?search=${encodeURIComponent(search)}`;
      if (roleFilter !== '') url += `&is_staff=${roleFilter}`;
      if (activeFilter !== '') url += `&is_active=${activeFilter}`;
      const res = await api.get(url);
      setUsers(res.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, activeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/users/', form);
      setAddModalOpen(false);
      setForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_staff: false,
        is_active: true,
        phone: '',
        bio: '',
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await api.patch(`/auth/users/${editUser.id}/`, form);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user.');
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.delete(`/auth/users/${deleteUser.id}/`);
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user.');
    }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      password: '',
      is_staff: u.is_staff,
      is_active: u.is_active,
      phone: u.phone || '',
      bio: u.bio || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E252B]">Users Management</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Admin directory: view profiles, assign administrative roles, manage credentials.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              username: '',
              email: '',
              first_name: '',
              last_name: '',
              password: '',
              is_staff: false,
              is_active: true,
              phone: '',
              bio: '',
            });
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FDFDFE] p-4 rounded-2xl border border-[#D6D9DF] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8F9192]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search username, email, name..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] focus:outline-hidden focus:ring-2 focus:ring-[#3D766D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Roles</option>
            <option value="true">Admin (is_staff=True)</option>
            <option value="false">User (is_staff=False)</option>
          </select>

          <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F3F5] text-[#8F9192] border-b border-[#D6D9DF]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Joined Date</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8F9192]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8F9192]">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-[#F0F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={u.full_name || u.username}
                          username={u.username}
                          isStaff={u.is_staff}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold text-[#1E252B]">
                            {u.full_name || u.username}
                          </div>
                          <div className="text-[11px] text-[#8F9192]">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#1E252B] font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.is_staff ? 'Admin' : 'User'} type="role" />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.is_active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-5 py-3.5 text-[#8F9192]">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => setDetailsUser(u)}
                        className="p-1.5 text-[#8F9192] hover:text-[#3D766D] rounded-lg hover:bg-[#F0F3F5]"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 text-[#8F9192] hover:text-[#3D766D] rounded-lg hover:bg-[#F0F3F5]"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteUser(u)}
                        className="p-1.5 text-[#8F9192] hover:text-rose-600 rounded-lg hover:bg-[#F0F3F5]"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Username *</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Initial Password *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="e.g. user123"
              className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={form.is_staff}
                onChange={e => setForm({ ...form, is_staff: e.target.checked })}
                className="rounded text-[#3D766D] focus:ring-[#3D766D] w-4 h-4"
              />
              <span className="font-semibold text-[#1E252B]">Admin (is_staff=True)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="rounded text-[#3D766D] focus:ring-[#3D766D] w-4 h-4"
              />
              <span className="font-semibold text-[#1E252B]">Active Account</span>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs cursor-pointer"
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs cursor-pointer text-[#1E252B]"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editUser && (
        <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit User: ${editUser.username}`}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={form.is_staff}
                  onChange={e => setForm({ ...form, is_staff: e.target.checked })}
                  className="rounded text-[#3D766D] focus:ring-[#3D766D] w-4 h-4"
                />
                <span className="font-semibold text-[#1E252B]">Admin (is_staff=True)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded text-[#3D766D] focus:ring-[#3D766D] w-4 h-4"
                />
                <span className="font-semibold text-[#1E252B]">Active Account</span>
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs cursor-pointer"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs cursor-pointer text-[#1E252B]"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View User Details Modal */}
      {detailsUser && (
        <Modal isOpen={!!detailsUser} onClose={() => setDetailsUser(null)} title="User Account Details">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-[#D6D9DF]">
              <UserAvatar
                name={detailsUser.full_name || detailsUser.username}
                username={detailsUser.username}
                isStaff={detailsUser.is_staff}
                size="lg"
              />
              <div>
                <h4 className="font-bold text-sm text-[#1E252B]">
                  {detailsUser.full_name || detailsUser.username}
                </h4>
                <p className="text-[#8F9192]">@{detailsUser.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={detailsUser.is_staff ? 'Admin' : 'User'} type="role" />
                  <StatusBadge status={detailsUser.is_active ? 'Active' : 'Inactive'} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#1E252B]">
                <Mail className="w-4 h-4 text-[#3D766D]" />
                <span>{detailsUser.email}</span>
              </div>
              {detailsUser.phone && (
                <div className="flex items-center gap-2 text-[#1E252B]">
                  <Phone className="w-4 h-4 text-[#3D766D]" />
                  <span>{detailsUser.phone}</span>
                </div>
              )}
            </div>

            {detailsUser.bio && (
              <div className="p-3 bg-[#F0F3F5] rounded-xl border border-[#D6D9DF]">
                <span className="font-bold text-[11px] block text-[#8F9192] mb-1">Bio:</span>
                <p className="text-[#1E252B]">{detailsUser.bio}</p>
              </div>
            )}

            <div className="pt-2 text-[11px] text-[#8F9192]">
              Joined on: {new Date(detailsUser.date_joined).toLocaleString()}
            </div>

            <div className="pt-3">
              <button
                onClick={() => setDetailsUser(null)}
                className="w-full py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold cursor-pointer text-[#1E252B]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Confirm User Deletion">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Are you sure you want to delete user <strong>{deleteUser.username}</strong>? This action cannot be undone.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
              >
                Yes, Delete User
              </button>
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs cursor-pointer text-[#1E252B]"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
