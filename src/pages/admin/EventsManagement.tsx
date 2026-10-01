import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import api from '../../api/axios';
import { EventItem, Category, Registration } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';

export const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventItem | null>(null);
  const [eventAttendees, setEventAttendees] = useState<Registration[]>([]);
  const [deleteEvent, setDeleteEvent] = useState<EventItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date_time: '',
    location: '',
    capacity: 50,
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled',
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [search, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/events/', { params });
      setEvents(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: categories[0]?.id?.toString() || '',
      date_time: '',
      location: '',
      capacity: 50,
      status: 'upcoming',
    });
    setBannerFile(null);
    setDocFile(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('date_time', new Date(form.date_time).toISOString());
      formData.append('location', form.location);
      formData.append('capacity', form.capacity.toString());
      formData.append('status', form.status);

      if (bannerFile) formData.append('banner', bannerFile);
      if (docFile) formData.append('documents', docFile);

      await api.post('/events/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAddModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      if (form.date_time) {
        formData.append('date_time', new Date(form.date_time).toISOString());
      }
      formData.append('location', form.location);
      formData.append('capacity', form.capacity.toString());
      formData.append('status', form.status);

      if (bannerFile) formData.append('banner', bannerFile);
      if (docFile) formData.append('documents', docFile);

      await api.patch(`/events/${editEvent.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEditEvent(null);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEvent) return;
    setActionLoading(true);

    try {
      await api.delete(`/events/${deleteEvent.id}/`);
      setDeleteEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete event.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (ev: EventItem) => {
    setEditEvent(ev);
    const localDate = new Date(ev.date_time);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    const dateStr = localDate.toISOString().slice(0, 16);

    setForm({
      title: ev.title,
      description: ev.description,
      category: ev.category?.toString() || '',
      date_time: dateStr,
      location: ev.location,
      capacity: ev.capacity,
      status: ev.status,
    });
    setBannerFile(null);
    setDocFile(null);
  };

  const openDetails = async (ev: EventItem) => {
    setDetailsEvent(ev);
    try {
      const res = await api.get(`/registrations/?event=${ev.id}`);
      setEventAttendees(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setEventAttendees([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E252B] tracking-tight">Events Management</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Create, schedule, edit, monitor capacity, and review registrations for all events.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
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
            placeholder="Search events, locations..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:outline-hidden focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden focus:ring-2 focus:ring-[#3D766D]"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden focus:ring-2 focus:ring-[#3D766D]"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F3F5] text-[#8F9192] border-b border-[#D6D9DF]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Event</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Date &amp; Time</th>
                <th className="px-5 py-3.5 font-semibold">Location</th>
                <th className="px-5 py-3.5 font-semibold">Capacity</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8F9192]">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8F9192]">
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-[#F0F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            ev.banner ||
                            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={ev.title}
                          className="w-10 h-10 rounded-xl object-cover border border-[#D6D9DF]"
                        />
                        <div className="max-w-xs">
                          <div className="font-semibold text-[#1E252B] truncate">
                            {ev.title}
                          </div>
                          <div className="text-[11px] text-[#8F9192] line-clamp-1">
                            {ev.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${ev.category_details?.color || '#3D766D'}18`,
                          color: ev.category_details?.color || '#3D766D',
                        }}
                      >
                        {ev.category_details?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#1E252B]">
                      {new Date(ev.date_time).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-[#8F9192] max-w-[150px] truncate">
                      {ev.location}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#1E252B]">
                      {ev.registered_count} / {ev.capacity}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openDetails(ev)}
                        className="p-1.5 text-[#8F9192] hover:text-[#3D766D] rounded-lg hover:bg-[#F0F3F5] transition-colors"
                        title="View Details & Attendees"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-1.5 text-[#8F9192] hover:text-[#2D5851] rounded-lg hover:bg-[#F0F3F5] transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteEvent(ev)}
                        className="p-1.5 text-[#8F9192] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Event"
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

      {/* Add / Edit Event Modal */}
      {(addModalOpen || editEvent) && (
        <Modal
          isOpen={addModalOpen || !!editEvent}
          onClose={() => {
            setAddModalOpen(false);
            setEditEvent(null);
          }}
          title={editEvent ? `Edit Event: ${editEvent.title}` : 'Add New Event'}
          maxWidth="lg"
        >
          <form onSubmit={editEvent ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Annual Product Summit 2026"
                className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                  Category *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                  Date and Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.date_time}
                  onChange={e => setForm({ ...form, date_time: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                  Capacity (Max Attendees) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Hall B, Tech Convention Center / Virtual Link"
                className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed itinerary and prerequisites..."
                className="w-full px-3 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
              />
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                  Banner Image (Django Media)
                </label>
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#D6D9DF] rounded-xl cursor-pointer hover:bg-[#F0F3F5] transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#3D766D]" />
                  <span className="text-[11px] text-[#8F9192] truncate">
                    {bannerFile ? bannerFile.name : 'Upload Event Banner'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setBannerFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E252B] mb-1">
                  Event Documents / PDF
                </label>
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#D6D9DF] rounded-xl cursor-pointer hover:bg-[#F0F3F5] transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#3D766D]" />
                  <span className="text-[11px] text-[#8F9192] truncate">
                    {docFile ? docFile.name : 'Upload Doc/PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={e => setDocFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#D6D9DF]">
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setEditEvent(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Saving...' : editEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Event Details & Attendees Modal */}
      {detailsEvent && (
        <Modal
          isOpen={!!detailsEvent}
          onClose={() => setDetailsEvent(null)}
          title={`Event Details: ${detailsEvent.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {detailsEvent.banner && (
              <img
                src={detailsEvent.banner}
                alt={detailsEvent.title}
                className="w-full h-44 object-cover rounded-xl border border-[#D6D9DF]"
              />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF]">
                {detailsEvent.category_details?.name || 'General'}
              </span>
              <StatusBadge status={detailsEvent.status} />
              <span className="text-xs text-[#8F9192]">
                Capacity: <strong className="text-[#1E252B]">{detailsEvent.registered_count}</strong> / {detailsEvent.capacity}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#1E252B] leading-relaxed">
              {detailsEvent.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F0F3F5] rounded-xl text-xs text-[#1E252B] border border-[#D6D9DF]">
              <div>
                <span className="text-[#8F9192] block text-[11px]">Date &amp; Time</span>
                <span className="font-semibold">{new Date(detailsEvent.date_time).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#8F9192] block text-[11px]">Location</span>
                <span className="font-semibold">{detailsEvent.location}</span>
              </div>
            </div>

            {/* Attendees List with Corporate Logo Badges (No Person Photos) */}
            <div>
              <h4 className="font-bold text-sm text-[#1E252B] mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#3D766D]" />
                <span>Registered Attendees ({eventAttendees.length})</span>
              </h4>

              {eventAttendees.length === 0 ? (
                <p className="text-[#8F9192] text-xs py-3">No registrations for this event yet.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-[#D6D9DF] border border-[#D6D9DF] rounded-xl bg-[#FDFDFE]">
                  {eventAttendees.map(reg => (
                    <div key={reg.id} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={reg.user_details?.full_name || reg.user_details?.username}
                          username={reg.user_details?.username}
                          isStaff={reg.user_details?.is_staff}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold text-[#1E252B]">
                            {reg.user_details?.full_name || reg.user_details?.username}
                          </div>
                          <div className="text-[10px] text-[#8F9192] font-mono">{reg.user_details?.email}</div>
                        </div>
                      </div>
                      <StatusBadge status={reg.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailsEvent(null)}
                className="px-4 py-2 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEvent && (
        <Modal
          isOpen={!!deleteEvent}
          onClose={() => setDeleteEvent(null)}
          title="Confirm Event Deletion"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Are you sure you want to delete <strong>{deleteEvent.title}</strong>? All attendee registrations will be cancelled.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteEvent(null)}
                className="px-4 py-2 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
