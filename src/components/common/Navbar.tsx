import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogIn, UserPlus, Menu, X, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from './UserAvatar';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, switchDemoAccount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoSwitch = async (role: 'admin' | 'user') => {
    try {
      await switchDemoAccount(role);
      setDemoMenuOpen(false);
      navigate(role === 'admin' ? '/admin' : '/user');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="bg-[#FDFDFE]/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#D6D9DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#3D766D] flex items-center justify-center text-[#FDFDFE] shadow-sm group-hover:bg-[#2D5851] transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-[#1E252B] tracking-tight">
                  Event<span className="text-[#3D766D]">&</span>Task
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF]">
                  System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link
                to="/"
                className="text-[#8F9192] hover:text-[#3D766D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-[#8F9192] hover:text-[#3D766D] px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/events"
                className="text-[#8F9192] hover:text-[#3D766D] px-3 py-2 text-sm font-medium transition-colors"
              >
                Events
              </Link>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D6D9DF] bg-[#F0F3F5] text-[#3D766D] text-xs font-semibold hover:bg-[#EBF3F1] transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-[#8F9192]" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-[#FDFDFE] border border-[#D6D9DF] p-2 z-50">
                  <div className="text-[10px] font-semibold text-[#8F9192] uppercase tracking-wider px-2 py-1">
                    Instant Demo Switch
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#1E252B] hover:bg-[#EBF3F1] flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[#3D766D]">Admin Panel</div>
                      <div className="text-[11px] text-[#8F9192]">Eleanor (is_staff=True)</div>
                    </div>
                    <span className="text-[10px] bg-[#3D766D] text-[#FDFDFE] px-1.5 py-0.5 rounded font-medium">
                      Admin
                    </span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('user')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#1E252B] hover:bg-[#EBF3F1] flex items-center justify-between mt-1 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[#1E252B]">User Panel</div>
                      <div className="text-[11px] text-[#8F9192]">John Doe (is_staff=False)</div>
                    </div>
                    <span className="text-[10px] bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] px-1.5 py-0.5 rounded font-medium">
                      User
                    </span>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isAdmin ? '/admin' : '/user'}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] hover:bg-[#F0F3F5] text-xs font-semibold text-[#1E252B] shadow-2xs transition-colors"
                >
                  <UserAvatar
                    name={user.full_name || user.username}
                    isStaff={user.is_staff}
                    size="xs"
                  />
                  <span>{isAdmin ? 'Admin Panel' : 'User Panel'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-[#8F9192] hover:text-[#1E252B] rounded-lg hover:bg-[#F0F3F5] transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[#1E252B] hover:text-[#3D766D] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[#8F9192]" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#8F9192] hover:text-[#1E252B] p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D6D9DF] px-4 pt-3 pb-5 space-y-3 bg-[#FDFDFE]">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1E252B]"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1E252B]"
          >
            About
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1E252B]"
          >
            Events
          </Link>

          <div className="pt-2 border-t border-[#D6D9DF]">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={isAdmin ? '/admin' : '/user'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-sm font-semibold text-[#FDFDFE] bg-[#3D766D] rounded-xl"
                >
                  Go to {isAdmin ? 'Admin' : 'User'} Panel
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full py-2 text-center text-sm font-medium text-rose-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold border border-[#D6D9DF] rounded-xl text-[#1E252B]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold bg-[#3D766D] text-[#FDFDFE] rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
