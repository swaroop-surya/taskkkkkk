import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Eye,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';
import { Registration } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const MyRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const [detailsReg, setDetailsReg] = useState<Registration | null>(null);
  const [cancelReg, setCancelReg] = useState<Registration | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrations/');
      setRegistrations(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async () => {
    if (!cancelReg) return;
    try {
      await api.post(`/registrations/${cancelReg.id}/cancel/`);
      setActionMessage('Your registration was cancelled successfully.');
      setCancelReg(null);
      fetchRegistrations();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      alert('Unable to cancel registration.');
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelled') return r.status === 'cancelled';
    if (activeTab === 'completed') return r.event_status === 'completed' || r.status === 'attended';
    if (activeTab === 'upcoming') {
      return r.status !== 'cancelled' && r.event_status === 'upcoming';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E252B] tracking-tight">My Registrations</h1>
        <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
          View your confirmed event seats, review event agendas, and manage cancellations.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-[#EBF3F1] border border-[#D6D9DF] text-[#2D5851] rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#EBF3F1] border border-[#D6D9DF] p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Completed Events
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'cancelled'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Cancelled Events
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          All ({registrations.length})
        </button>
      </div>

      {/* Registrations List / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-[#EBF3F1]/60 animate-pulse" />
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-16 bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF]">
          <Calendar className="w-12 h-12 text-[#BDC2C7] mx-auto mb-3" />
          <h3 className="font-semibold text-[#1E252B]">No registrations found</h3>
          <p className="text-xs text-[#8F9192] mt-1">Explore the Events directory to RSVP for sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRegistrations.map(reg => (
            <div
              key={reg.id}
              className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#3D766D] uppercase tracking-wider">
                    {reg.event_category}
                  </span>
                  <StatusBadge status={reg.status} />
                </div>

                <h3 className="font-bold text-base text-[#1E252B] line-clamp-1">
                  {reg.event_title}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-[#8F9192]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#3D766D]" />
                    <span>{new Date(reg.event_date).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2D5851]" />
                    <span className="truncate">{reg.event_location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D6D9DF] flex items-center justify-between">
                <button
                  onClick={() => setDetailsReg(reg)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F9192] hover:text-[#3D766D] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                {reg.status !== 'cancelled' && (
                  <button
                    onClick={() => setCancelReg(reg)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel RSVP</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {detailsReg && (
        <Modal
          isOpen={!!detailsReg}
          onClose={() => setDetailsReg(null)}
          title={`RSVP: ${detailsReg.event_title}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6D9DF]">
              <span className="font-semibold text-[#8F9192]">Registration Status:</span>
              <StatusBadge status={detailsReg.status} />
            </div>

            <div className="space-y-2 text-[#1E252B]">
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Date &amp; Time:</span>
                <span className="font-semibold">{new Date(detailsReg.event_date).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Location:</span>
                <span className="font-semibold">{detailsReg.event_location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Category:</span>
                <span className="font-semibold">{detailsReg.event_category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Registered On:</span>
                <span>{new Date(detailsReg.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {detailsReg.notes && (
              <div className="p-3 bg-[#F0F3F5] rounded-xl border border-[#D6D9DF]">
                <span className="block font-semibold mb-1 text-[#8F9192]">My RSVP Notes:</span>
                <p className="text-[#1E252B]">{detailsReg.notes}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setDetailsReg(null)}
                className="w-full py-2.5 rounded-xl border border-[#D6D9DF] font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelReg && (
        <Modal
          isOpen={!!cancelReg}
          onClose={() => setCancelReg(null)}
          title="Cancel Event Registration"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Are you sure you want to cancel your registration for <strong>{cancelReg.event_title}</strong>? Your seat will be freed.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleCancelRegistration}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => setCancelReg(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Keep RSVP
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
