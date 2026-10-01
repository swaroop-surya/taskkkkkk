import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Eye,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/axios';
import { Registration, EventItem, User as UserType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';

export const RegistrationsManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [detailsReg, setDetailsReg] = useState<Registration | null>(null);
  const [updateStatusReg, setUpdateStatusReg] = useState<Registration | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'cancelled' | 'attended'>('approved');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      let url = `/registrations/?search=${encodeURIComponent(search)}`;
      if (eventFilter) url += `&event=${eventFilter}`;
      if (userFilter) url += `&user=${userFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const [regsRes, eventsRes, usersRes] = await Promise.all([
        api.get(url),
        api.get('/events/'),
        api.get('/auth/users/'),
      ]);
      setRegistrations(regsRes.data.results);
      setEvents(eventsRes.data.results);
      setUsers(usersRes.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [search, eventFilter, userFilter, statusFilter]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStatusReg) return;
    try {
      await api.patch(`/registrations/${updateStatusReg.id}/`, { status: newStatus });
      setUpdateStatusReg(null);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E252B]">Registrations Management</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            View attendee records, filter by event or user, and update RSVP verification status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FDFDFE] p-4 rounded-2xl border border-[#D6D9DF] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8F9192]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search attendee, event..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter by Event */}
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden max-w-[180px] truncate"
          >
            <option value="">All Events</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Filter by User */}
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="attended">Attended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F3F5] text-[#8F9192] border-b border-[#D6D9DF]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Attendee</th>
                <th className="px-5 py-3.5 font-semibold">Event</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Event Date</th>
                <th className="px-5 py-3.5 font-semibold">Registered At</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8F9192]">
                    Loading registrations...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8F9192]">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map(r => (
                  <tr key={r.id} className="hover:bg-[#F0F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={r.user_details?.full_name || r.user_details?.username}
                          username={r.user_details?.username}
                          isStaff={r.user_details?.is_staff}
                          size="xs"
                        />
                        <div>
                          <div className="font-semibold text-[#1E252B]">
                            {r.user_details?.full_name || r.user_details?.username}
                          </div>
                          <div className="text-[10px] text-[#8F9192]">{r.user_details?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#1E252B] max-w-xs truncate">
                      {r.event_title}
                    </td>
                    <td className="px-5 py-3.5 text-[#8F9192]">
                      {r.event_category}
                    </td>
                    <td className="px-5 py-3.5 text-[#8F9192]">
                      {new Date(r.event_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-[#8F9192]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => setDetailsReg(r)}
                        className="p-1.5 text-[#8F9192] hover:text-[#3D766D] rounded-lg hover:bg-[#F0F3F5]"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUpdateStatusReg(r);
                          setNewStatus(r.status);
                        }}
                        className="px-2.5 py-1 bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#3D766D] font-semibold rounded-lg text-[11px] border border-[#D6D9DF] cursor-pointer"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {detailsReg && (
        <Modal isOpen={!!detailsReg} onClose={() => setDetailsReg(null)} title="Registration Details">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-[#F0F3F5] rounded-xl border border-[#D6D9DF]">
              <UserAvatar
                name={detailsReg.user_details?.full_name || detailsReg.user_details?.username}
                username={detailsReg.user_details?.username}
                isStaff={detailsReg.user_details?.is_staff}
                size="md"
              />
              <div>
                <h4 className="font-bold text-[#1E252B]">
                  {detailsReg.user_details?.full_name || detailsReg.user_details?.username}
                </h4>
                <p className="text-[#8F9192] text-[11px]">@{detailsReg.user_details?.username} • {detailsReg.user_details?.email}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#D6D9DF] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Event:</span>
                <span className="font-semibold text-[#3D766D]">{detailsReg.event_title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Date:</span>
                <span>{new Date(detailsReg.event_date).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Location:</span>
                <span>{detailsReg.event_location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Status:</span>
                <StatusBadge status={detailsReg.status} />
              </div>
              {detailsReg.notes && (
                <div className="pt-2">
                  <span className="text-[#8F9192] block mb-1">Attendee Notes:</span>
                  <p className="p-2 bg-[#F0F3F5] rounded border border-[#D6D9DF]">{detailsReg.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDetailsReg(null)}
                className="w-full py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      {updateStatusReg && (
        <Modal
          isOpen={!!updateStatusReg}
          onClose={() => setUpdateStatusReg(null)}
          title="Update Registration Status"
          maxWidth="sm"
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
            <div>
              <p className="text-[#8F9192] mb-2">
                Updating status for <strong className="text-[#1E252B]">{updateStatusReg.user_details?.username}</strong> registered in{' '}
                <strong className="text-[#1E252B]">{updateStatusReg.event_title}</strong>:
              </p>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="attended">Attended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs cursor-pointer"
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setUpdateStatusReg(null)}
                className="px-4 py-2 rounded-xl border border-[#D6D9DF] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
