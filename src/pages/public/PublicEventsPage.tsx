import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import api from '../../api/axios';
import { EventItem, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const PublicEventsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [registering, setRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data.results || res.data);
    } catch {
      // fallback
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/events/', { params });
      setEvents(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setSuccessMessage('');
    try {
      await api.post(`/events/${eventId}/register/`);
      setSuccessMessage('Successfully registered for this event!');
      fetchEvents();
      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E252B] tracking-tight">Public Events &amp; Sessions</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-1">
            Discover community gatherings, workshops, keynotes, and schedule items.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#FDFDFE] p-4 rounded-2xl border border-[#D6D9DF] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8F9192]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search events, locations..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:outline-hidden focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#3D766D] text-[#FDFDFE]'
                : 'bg-[#F0F3F5] text-[#8F9192] hover:text-[#1E252B] border border-[#D6D9DF]'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#3D766D] text-[#FDFDFE]'
                  : 'bg-[#F0F3F5] text-[#8F9192] hover:text-[#1E252B] border border-[#D6D9DF]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2 text-xs">
          <span className="text-[#8F9192]">Status:</span>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-[#1E252B] text-xs focus:ring-2 focus:ring-[#3D766D] outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-[#EBF3F1]/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#FDFDFE] rounded-3xl border border-[#D6D9DF] p-12 text-center">
          <Calendar className="w-12 h-12 text-[#BDC2C7] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#1E252B]">No events found</h3>
          <p className="text-xs text-[#8F9192] mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="h-44 relative bg-[#F0F3F5] overflow-hidden">
                <img
                  src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2.5 py-1 text-xs font-semibold rounded-md shadow-xs bg-[#FDFDFE]/90 text-[#1E252B] backdrop-blur-xs"
                    style={{ borderLeft: `3px solid ${event.category_details?.color || '#3D766D'}` }}
                  >
                    {event.category_details?.name || 'General'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={event.status} />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-base text-[#1E252B] line-clamp-1 group-hover:text-[#3D766D] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-[#8F9192] mt-2 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#D6D9DF] text-xs text-[#8F9192]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#3D766D]" />
                    <span>{new Date(event.date_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2D5851]" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#3D766D]" />
                    <span>{event.registered_count} / {event.capacity} Registered</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalEvent(event)}
                  className="w-full py-2.5 text-xs font-semibold text-center rounded-xl bg-[#F0F3F5] text-[#1E252B] hover:bg-[#3D766D] hover:text-[#FDFDFE] border border-[#D6D9DF] transition-colors cursor-pointer"
                >
                  View Details &amp; Registration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details & Registration Modal */}
      {activeModalEvent && (
        <Modal
          isOpen={!!activeModalEvent}
          onClose={() => setActiveModalEvent(null)}
          title={activeModalEvent.title}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {successMessage && (
              <div className="p-3 bg-[#EBF3F1] border border-[#D6D9DF] text-[#2D5851] rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span>{successMessage}</span>
              </div>
            )}

            {activeModalEvent.banner && (
              <img
                src={activeModalEvent.banner}
                alt={activeModalEvent.title}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF]">
                {activeModalEvent.category_details?.name || 'General'}
              </span>
              <StatusBadge status={activeModalEvent.status} />
              <span className="text-xs text-[#8F9192]">
                Registered: <strong className="text-[#1E252B]">{activeModalEvent.registered_count}</strong> / {activeModalEvent.capacity}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#1E252B] leading-relaxed">
              {activeModalEvent.description}
            </p>

            <div className="p-3.5 bg-[#F0F3F5] rounded-xl space-y-2 text-xs text-[#1E252B] border border-[#D6D9DF]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3D766D]" />
                <span>{new Date(activeModalEvent.date_time).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2D5851]" />
                <span>{activeModalEvent.location}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              {activeModalEvent.is_registered ? (
                <div className="flex-1 py-2.5 rounded-xl bg-[#EBF3F1] border border-[#D6D9DF] text-[#2D5851] text-xs font-bold text-center">
                  ✓ You are already registered ({activeModalEvent.user_registration_status})
                </div>
              ) : activeModalEvent.status === 'cancelled' ? (
                <div className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold text-center">
                  Event Cancelled
                </div>
              ) : (
                <button
                  onClick={() => handleRegister(activeModalEvent.id)}
                  disabled={registering}
                  className="flex-1 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {registering
                    ? 'Processing RSVP...'
                    : isAuthenticated
                    ? 'Confirm Event Registration'
                    : 'Sign In to Register'}
                </button>
              )}
              <button
                onClick={() => setActiveModalEvent(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
