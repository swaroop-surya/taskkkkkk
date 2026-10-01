import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { NotificationItem } from '../../types';

export const UserNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/mark_as_read/`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('TASK')) {
      return <CheckSquare className="w-4 h-4 text-[#3D766D]" />;
    } else if (type.includes('EVENT') || type.includes('REGISTRATION')) {
      return <Calendar className="w-4 h-4 text-[#2D5851]" />;
    }
    return <Sparkles className="w-4 h-4 text-[#3D766D]" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E252B] tracking-tight">My Notifications</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Real-time updates regarding task assignments, event registrations, and schedule changes.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5 text-[#3D766D]" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[#EBF3F1]/60 rounded-2xl animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF]">
            <Bell className="w-8 h-8 text-[#BDC2C7] mx-auto mb-2" />
            <p className="text-xs text-[#8F9192]">You're all caught up! No notifications.</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.is_read
                  ? 'bg-[#FDFDFE] border-[#D6D9DF] opacity-80'
                  : 'bg-[#EBF3F1]/50 border-[#3D766D]/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#FDFDFE] border border-[#D6D9DF] shadow-2xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#3D766D] uppercase tracking-wider">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1E252B] mt-1">
                    {item.message}
                  </p>
                  <p className="text-[11px] text-[#8F9192] mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {!item.is_read && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FDFDFE] text-[11px] font-semibold text-[#3D766D] border border-[#D6D9DF] hover:bg-[#EBF3F1] cursor-pointer shrink-0 transition-colors"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
