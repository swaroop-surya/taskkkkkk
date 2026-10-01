import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  FileCheck,
  Clock,
  ArrowRight,
  Bell,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import { UserStats, NotificationItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    total_registered_events: 0,
    upcoming_events: 0,
    pending_tasks: 0,
    completed_tasks: 0,
  });
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats/');
        if (!res.data.is_admin) {
          setStats(res.data.stats);
          setRecentNotifications(res.data.recent_notifications || []);
        }
      } catch (e) {
        console.error('Error loading user dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    {
      title: 'Total Registered Events',
      value: stats.total_registered_events,
      icon: FileCheck,
      link: '/user/registrations',
      desc: 'All active event RSVPs',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcoming_events,
      icon: Calendar,
      link: '/user/registrations',
      desc: 'Sessions coming up soon',
    },
    {
      title: 'Pending Tasks',
      value: stats.pending_tasks,
      icon: Clock,
      link: '/user/tasks',
      desc: 'Pending & in-progress duties',
    },
    {
      title: 'Completed Tasks',
      value: stats.completed_tasks,
      icon: CheckSquare,
      link: '/user/tasks',
      desc: 'Finished assignments',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#3D766D] text-[#FDFDFE] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5851] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#EBF3F1]" />
            <span>Member Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-[#EBF3F1] text-xs sm:text-sm">
            Track your registered sessions, update assigned task milestones, and review platform notifications.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
          <Link
            to="/user/events"
            className="px-4 py-2.5 rounded-xl bg-[#FDFDFE] text-[#3D766D] font-semibold text-xs shadow-xs hover:bg-[#F0F3F5] transition-colors"
          >
            Browse New Events
          </Link>
          <Link
            to="/user/tasks"
            className="px-4 py-2.5 rounded-xl bg-[#2D5851] hover:bg-[#23443E] text-[#FDFDFE] font-semibold text-xs transition-colors"
          >
            Review My Tasks ({stats.pending_tasks} Pending)
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-5 rounded-2xl bg-[#FDFDFE] border border-[#D6D9DF] hover:border-[#3D766D] transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#EBF3F1] text-[#3D766D]">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#BDC2C7] group-hover:text-[#3D766D] transition-colors" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#8F9192] uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-[#1E252B] mt-1 tabular-nums">
                  {loading ? '...' : card.value}
                </p>
                <p className="text-[11px] text-[#8F9192] mt-0.5">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid: Notifications & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <div className="lg:col-span-2 bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D6D9DF]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#3D766D]" />
              <h3 className="font-bold text-sm text-[#1E252B]">Recent Member Notifications</h3>
            </div>
            <Link to="/user/notifications" className="text-xs font-semibold text-[#3D766D] hover:underline">
              View All ↗
            </Link>
          </div>

          <div className="divide-y divide-[#D6D9DF]">
            {recentNotifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#8F9192]">No recent notifications.</p>
            ) : (
              recentNotifications.map(n => (
                <div key={n.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-[#EBF3F1] text-[#3D766D] shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1E252B] font-medium">{n.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8F9192] mt-0.5">
                      <span className="font-mono text-[#3D766D] font-semibold">{n.type}</span>
                      <span>•</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Portal Navigation */}
        <div className="bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#1E252B]">Your Portals</h3>
          <div className="space-y-2 text-xs">
            <Link
              to="/user/events"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">Browse Events Directory</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>

            <Link
              to="/user/registrations"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">My Registrations &amp; RSVPs</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>

            <Link
              to="/user/tasks"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">My Assigned Tasks</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
