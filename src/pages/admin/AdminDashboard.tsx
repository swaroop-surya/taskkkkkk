import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  CheckSquare,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Bell,
  Clock,
} from 'lucide-react';
import api from '../../api/axios';
import { AdminStats, NotificationItem } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_events: 0,
    total_tasks: 0,
    total_registrations: 0,
  });
  const [recentActivities, setRecentActivities] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/stats/');
        if (res.data.is_admin) {
          setStats(res.data.stats);
          setRecentActivities(res.data.recent_activities || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      link: '/admin/users',
      desc: 'Active system accounts',
    },
    {
      title: 'Total Events',
      value: stats.total_events,
      icon: Calendar,
      link: '/admin/events',
      desc: 'Scheduled conferences & workshops',
    },
    {
      title: 'Total Tasks',
      value: stats.total_tasks,
      icon: CheckSquare,
      link: '/admin/tasks',
      desc: 'Active & completed deliverables',
    },
    {
      title: 'Registrations',
      value: stats.total_registrations,
      icon: FileCheck,
      link: '/admin/registrations',
      desc: 'Confirmed event RSVPs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E252B]">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Operational overview of platform accounts, scheduled events, and task deliverables.
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </Link>
          <Link
            to="/admin/tasks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FDFDFE] hover:bg-[#F0F3F5] text-[#1E252B] border border-[#D6D9DF] text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#3D766D]" />
            <span>Assign Task</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
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

      {/* Grid: Recent Activities Stream & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Activities */}
        <div className="lg:col-span-2 bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D6D9DF]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3D766D]" />
              <h3 className="font-bold text-sm text-[#1E252B]">Recent Activities &amp; Signals</h3>
            </div>
            <Link to="/admin/notifications" className="text-xs font-semibold text-[#3D766D] hover:underline">
              View All Notifications ↗
            </Link>
          </div>

          <div className="divide-y divide-[#D6D9DF]">
            {recentActivities.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#8F9192]">No activities recorded yet.</p>
            ) : (
              recentActivities.map(act => (
                <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-[#EBF3F1] text-[#3D766D] shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1E252B] font-medium">{act.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8F9192] mt-0.5">
                      <span className="font-mono text-[#3D766D] font-semibold">{act.type}</span>
                      <span>•</span>
                      <span>{new Date(act.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Portals */}
        <div className="bg-[#FDFDFE] p-6 rounded-2xl border border-[#D6D9DF] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#1E252B]">Quick Management Portals</h3>
          <div className="space-y-2 text-xs">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">Manage Users</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>

            <Link
              to="/admin/events"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">Manage Events</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>

            <Link
              to="/admin/tasks"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">Manage Tasks</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>

            <Link
              to="/admin/registrations"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#1E252B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#3D766D]" />
                <span className="font-semibold">Manage Registrations</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9192]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
