import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Users,
  Shield,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import api from '../../api/axios';
import { EventItem, Category } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { switchDemoAccount } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          api.get('/events/?status=upcoming'),
          api.get('/categories/'),
        ]);
        setEvents(eventsRes.data.results.slice(0, 3));
        setCategories(catsRes.data.results);
      } catch (err) {
        console.error('Error loading landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDemo = async (role: 'admin' | 'user') => {
    await switchDemoAccount(role);
    navigate(role === 'admin' ? '/admin' : '/user');
  };

  return (
    <div className="space-y-16 pb-16 bg-[#F0F3F5] text-[#1E252B]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FDFDFE] pt-16 pb-20 border-b border-[#D6D9DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF3F1] border border-[#D6D9DF] text-[#3D766D] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Architecture • Django REST Framework + React + SimpleJWT</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1E252B] leading-[1.15]">
              Seamless <span className="text-[#3D766D]">Event Coordination</span> &amp; Precision Task Execution.
            </h1>

            <p className="text-base sm:text-lg text-[#8F9192]">
              A unified platform featuring role-based workflows for Administrators and Members. Manage events, track attendee registrations, assign tasks, and monitor deadlines in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold shadow-xs transition-all hover:scale-[1.01]"
              >
                <span>Browse Upcoming Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FDFDFE] hover:bg-[#F0F3F5] text-[#1E252B] border border-[#D6D9DF] font-semibold transition-all"
              >
                <span>Create New Account</span>
              </Link>
            </div>

            {/* Instant Demo Launcher Bar */}
            <div className="pt-4">
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-2xl bg-[#F0F3F5] border border-[#D6D9DF] text-xs">
                <span className="font-semibold text-[#8F9192] px-2 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#3D766D]" />
                  Instant Reviewer Logins:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDemo('admin')}
                    className="px-3 py-1.5 rounded-lg bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold cursor-pointer transition-colors"
                  >
                    Launch as Admin (Eleanor)
                  </button>
                  <button
                    onClick={() => handleDemo('user')}
                    className="px-3 py-1.5 rounded-lg bg-[#FDFDFE] hover:bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] font-semibold cursor-pointer transition-colors"
                  >
                    Launch as Member (John Doe)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Flowchart Visual Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-[#1E252B]">Role-Based System Flow</h2>
          <p className="text-sm text-[#8F9192] mt-1">Single login portal with automated role validation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Flow Card */}
          <div className="border border-[#D6D9DF] bg-[#FDFDFE] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3D766D] text-[#FDFDFE] flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1E252B]">Admin Panel</h3>
                <span className="text-xs font-mono text-[#3D766D]">is_staff = True</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-sm text-[#8F9192]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">User Management:</strong> Add, edit, deactivate, and view details.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">Event Management:</strong> Create events with banners, dates &amp; docs.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">Task Assignment:</strong> Assign tasks to members with priority and deadlines.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">Registrations &amp; Categories:</strong> Review attendees &amp; update status.</span>
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-[#D6D9DF]">
              <Link
                to="/admin"
                className="text-xs font-bold text-[#3D766D] hover:underline inline-flex items-center gap-1"
              >
                Explore Admin View ↗
              </Link>
            </div>
          </div>

          {/* User Flow Card */}
          <div className="border border-[#D6D9DF] bg-[#FDFDFE] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2D5851] text-[#FDFDFE] flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1E252B]">User Panel</h3>
                <span className="text-xs font-mono text-[#3D766D]">is_staff = False (Default)</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-sm text-[#8F9192]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">Browse &amp; Register:</strong> Discover sessions and 1-click RSVP.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">My Registrations:</strong> Track upcoming, completed, or cancelled status.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">My Tasks:</strong> Update task lifecycle (Pending → In Progress → Completed).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
                <span><strong className="text-[#1E252B]">Real-Time Notifications:</strong> Task assignments, deadlines &amp; cancellations.</span>
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-[#D6D9DF]">
              <Link
                to="/user"
                className="text-xs font-bold text-[#3D766D] hover:underline inline-flex items-center gap-1"
              >
                Explore Member View ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1E252B]">Featured Upcoming Events</h2>
            <p className="text-sm text-[#8F9192] mt-0.5">Explore sessions curated by our organizers</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-[#3D766D] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-[#D6D9DF] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(event => (
              <div
                key={event.id}
                className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] overflow-hidden shadow-xs hover:border-[#3D766D] transition-all flex flex-col group"
              >
                <div className="h-44 overflow-hidden relative bg-[#F0F3F5]">
                  <img
                    src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
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
                  </div>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full py-2.5 text-xs font-semibold text-center rounded-xl bg-[#F0F3F5] text-[#1E252B] hover:bg-[#3D766D] hover:text-[#FDFDFE] transition-colors cursor-pointer border border-[#D6D9DF]"
                  >
                    View Details &amp; Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {selectedEvent.banner && (
              <img
                src={selectedEvent.banner}
                alt={selectedEvent.title}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF]">
                {selectedEvent.category_details?.name || 'General'}
              </span>
              <StatusBadge status={selectedEvent.status} />
              <span className="text-[#8F9192]">
                Registered: <strong className="text-[#1E252B]">{selectedEvent.registered_count}</strong> / {selectedEvent.capacity}
              </span>
            </div>

            <p className="text-sm text-[#1E252B] leading-relaxed">
              {selectedEvent.description}
            </p>

            <div className="p-3 bg-[#F0F3F5] rounded-xl space-y-2 text-[#1E252B] border border-[#D6D9DF]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3D766D]" />
                <span>{new Date(selectedEvent.date_time).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3D766D]" />
                <span>{selectedEvent.location}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate('/login');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs cursor-pointer"
              >
                Sign In to Register for Event
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] cursor-pointer"
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
