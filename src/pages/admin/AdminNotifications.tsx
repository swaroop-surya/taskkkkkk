import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Calendar,
  CheckSquare,
  User,
  Trash2,
  Filter,
} from 'lucide-react';
import api from '../../api/axios';
import { NotificationItem } from '../../types';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/?all=true');
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

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark-read/`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'NEW_USER':
        return <User className="w-4 h-4 text-[#3D766D]" />;
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_CANCELLED':
        return <Calendar className="w-4 h-4 text-[#3D766D]" />;
      case 'TASK_COMPLETED':
      case 'TASK_ASSIGNED':
      case 'TASK_OVERDUE':
        return <CheckSquare className="w-4 h-4 text-[#2D5851]" />;
      default:
        return <Bell className="w-4 h-4 text-[#3D766D]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E252B] tracking-tight">System &amp; Event Notifications</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Audit logs and real-time triggers dispatched across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#3D766D]" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#EBF3F1] border border-[#D6D9DF] p-1 rounded-xl w-fit text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Unread ({notifications.filter(n => !n.is_read).length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filter === 'read'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Read ({notifications.filter(n => n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[#EBF3F1]/60 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF]">
            <Bell className="w-8 h-8 text-[#BDC2C7] mx-auto mb-2" />
            <p className="text-xs text-[#8F9192]">No notifications in this filter.</p>
          </div>
        ) : (
          filtered.map(item => (
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
                  {getIconForType(item.type)}
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
                  onClick={() => markSingleRead(item.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#3D766D] hover:bg-[#EBF3F1] border border-[#D6D9DF] rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
