import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileCheck,
  CheckSquare,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemLogsDrawer } from '../components/common/SystemLogsDrawer';
import { UserAvatar } from '../components/common/UserAvatar';
import api from '../api/axios';

export const UserLayout: React.FC = () => {
  const { user, logout, switchDemoAccount } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/');
        const count = res.data.results.filter((n: any) => !n.is_read).length;
        setUnreadNotifications(count);
      } catch (e) {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/user', icon: LayoutDashboard, exact: true },
    { name: 'Browse Events', path: '/user/events', icon: Calendar },
    { name: 'My Registrations', path: '/user/registrations', icon: FileCheck },
    { name: 'My Tasks', path: '/user/tasks', icon: CheckSquare },
    { name: 'Notifications', path: '/user/notifications', icon: Bell, badge: unreadNotifications },
    { name: 'Profile', path: '/user/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3F5] flex flex-col md:flex-row text-[#1E252B]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1E252B]/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FDFDFE] border-r border-[#D6D9DF] flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#D6D9DF]">
          <Link to="/user" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3D766D] flex items-center justify-center text-[#FDFDFE] shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#1E252B]">Member Space</span>
              <span className="block text-[10px] text-[#3D766D] font-mono">is_staff=False</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#8F9192] hover:text-[#1E252B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Logo Card */}
        <div className="p-3 mx-3 my-3 bg-[#F0F3F5] rounded-xl border border-[#D6D9DF] flex items-center gap-3">
          <UserAvatar
            name={user?.full_name || user?.username}
            username={user?.username}
            isStaff={false}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1E252B] truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-[10px] font-semibold text-[#3D766D]">Member</p>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#EBF3F1] text-[#3D766D] border-l-3 border-[#3D766D]'
                      : 'text-[#8F9192] hover:bg-[#F0F3F5] hover:text-[#1E252B]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 opacity-90" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#3D766D] text-[#FDFDFE] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Demo Switcher / Footer */}
        <div className="p-3 border-t border-[#D6D9DF] space-y-2">
          <button
            onClick={async () => {
              await switchDemoAccount('admin');
              navigate('/admin');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#F0F3F5] hover:bg-[#EBF3F1] text-[#3D766D] text-xs font-semibold border border-[#D6D9DF] transition-colors cursor-pointer"
            title="Switch to Admin Panel (Eleanor)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#3D766D]" />
            <span>Switch to Admin Panel</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#FDFDFE] border-b border-[#D6D9DF] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#8F9192] hover:text-[#1E252B] p-2 rounded-lg hover:bg-[#F0F3F5]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#8F9192]">
              <Link to="/user" className="hover:text-[#3D766D]">Member Space</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-[#1E252B]">Registered Events &amp; Tasks</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/user/notifications"
              className="relative p-2 text-[#8F9192] hover:text-[#1E252B] rounded-lg hover:bg-[#F0F3F5] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3D766D] rounded-full" />
              )}
            </Link>

            <Link
              to="/"
              className="text-xs font-semibold text-[#3D766D] hover:underline hidden sm:inline"
            >
              Public Site ↗
            </Link>

            <Link to="/user/profile" className="flex items-center gap-2.5 pl-3 border-l border-[#D6D9DF]">
              <UserAvatar
                name={user?.full_name || user?.username}
                username={user?.username}
                isStaff={false}
                size="sm"
              />
              <span className="text-xs font-semibold text-[#1E252B] hidden sm:inline">
                {user?.username}
              </span>
            </Link>
          </div>
        </header>

        {/* Routed User Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <SystemLogsDrawer />
    </div>
  );
};
