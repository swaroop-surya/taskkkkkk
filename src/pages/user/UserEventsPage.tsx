import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import { EventItem, Category } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const UserEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [modalEvent, setModalEvent] = useState<EventItem | null>(null);
  const [registering, setRegistering] = useState(false);
  const [rsvpNotes, setRsvpNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `/events/?status=upcoming&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;

      const [eventsRes, catsRes] = await Promise.all([
        api.get(url),
        api.get('/categories/'),
      ]);
      setEvents(eventsRes.data.results);
      setCategories(catsRes.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, selectedCategory]);

  const handleRegister = async (eventId: number) => {
    setRegistering(true);
    setFeedback(null);
    try {
      await api.post(`/events/${eventId}/register/`, { notes: rsvpNotes });
      setFeedback({
        type: 'success',
        message: 'Registration confirmed! A confirmation email was sent to your inbox.',
      });
      setRsvpNotes('');
      fetchEvents();
      if (modalEvent && modalEvent.id === eventId) {
        setModalEvent({ ...modalEvent, is_registered: true, user_registration_status: 'approved' });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Registration failed.',
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E252B]">Browse Events</h1>
        <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
          Explore upcoming conferences, workshops, and team roundtables. One-click registration.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-[#EBF3F1] border-[#C3DAD5] text-[#2D5851]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3D766D] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-[#FDFDFE] p-4 rounded-2xl border border-[#D6D9DF] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8F9192]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, locations..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] outline-hidden text-[#1E252B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#3D766D] text-[#FDFDFE]'
                : 'bg-[#F0F3F5] text-[#8F9192] hover:text-[#1E252B] hover:bg-[#EBF3F1]'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#3D766D] text-[#FDFDFE]'
                  : 'bg-[#F0F3F5] text-[#8F9192] hover:text-[#1E252B] hover:bg-[#EBF3F1]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Events */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-[#D6D9DF] animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF]">
          <Calendar className="w-12 h-12 text-[#BDC2C7] mx-auto mb-3" />
          <h3 className="font-semibold text-[#1E252B]">No upcoming events found</h3>
          <p className="text-xs text-[#8F9192] mt-1">Check back later or adjust your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] overflow-hidden shadow-xs hover:border-[#3D766D] transition-all flex flex-col group"
            >
              <div className="h-44 relative bg-[#F0F3F5] overflow-hidden">
                <img
                  src={
                    event.banner ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2.5 py-1 text-xs font-semibold rounded-md shadow-xs bg-[#FDFDFE] text-[#1E252B] border border-[#D6D9DF]"
                    style={{ borderLeft: `3px solid ${event.category_details?.color || '#3D766D'}` }}
                  >
                    {event.category_details?.name || 'General'}
                  </span>
                </div>
                {event.is_registered && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#3D766D] text-[#FDFDFE] text-xs font-bold shadow-xs">
                      ✓ Registered
                    </span>
                  </div>
                )}
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
                    <MapPin className="w-3.5 h-3.5 text-[#3D766D]" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#3D766D]" />
                    <span>{event.registered_count} / {event.capacity} Registered</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setModalEvent(event);
                      setFeedback(null);
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#F0F3F5] text-[#1E252B] hover:bg-[#EBF3F1] border border-[#D6D9DF] cursor-pointer"
                  >
                    View Details
                  </button>
                  {event.is_registered ? (
                    <span className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#EBF3F1] text-[#3D766D] border border-[#C3DAD5] flex items-center justify-center">
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={registering}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      RSVP Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details & Registration Modal */}
      {modalEvent && (
        <Modal
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
          title={modalEvent.title}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {modalEvent.banner && (
              <img
                src={modalEvent.banner}
                alt={modalEvent.title}
                className="w-full h-44 object-cover rounded-xl"
              />
            )}

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] font-semibold">
                {modalEvent.category_details?.name || 'General'}
              </span>
              <StatusBadge status={modalEvent.status} />
              <span className="text-[#8F9192]">
                Registered: <strong className="text-[#1E252B]">{modalEvent.registered_count}</strong> / {modalEvent.capacity}
              </span>
            </div>

            <p className="text-[#1E252B] leading-relaxed text-sm">
              {modalEvent.description}
            </p>

            <div className="p-3 bg-[#F0F3F5] rounded-xl space-y-2 border border-[#D6D9DF]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3D766D]" />
                <span>{new Date(modalEvent.date_time).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D766D]" />
                <span>{modalEvent.location}</span>
              </div>
            </div>

            {modalEvent.is_registered ? (
              <div className="p-3 bg-[#EBF3F1] border border-[#C3DAD5] text-[#2D5851] rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span>You are registered for this event ({modalEvent.user_registration_status})</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block font-semibold text-[#1E252B]">Notes / Special Accommodations (Optional):</label>
                <input
                  type="text"
                  value={rsvpNotes}
                  onChange={e => setRsvpNotes(e.target.value)}
                  placeholder="e.g. Attending keynote breakout"
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-[#1E252B]"
                />
              </div>
            )}

            <div className="pt-3 flex gap-3">
              {!modalEvent.is_registered && (
                <button
                  onClick={() => handleRegister(modalEvent.id)}
                  disabled={registering}
                  className="flex-1 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs disabled:opacity-50 cursor-pointer"
                >
                  {registering ? 'Processing RSVP...' : 'Confirm Registration'}
                </button>
              )}
              <button
                onClick={() => setModalEvent(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] font-semibold text-[#1E252B] cursor-pointer"
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
