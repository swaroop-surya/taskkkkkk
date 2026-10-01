import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { PublicEventsPage } from './pages/public/PublicEventsPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersManagement } from './pages/admin/UsersManagement';
import { EventsManagement } from './pages/admin/EventsManagement';
import { TasksManagement } from './pages/admin/TasksManagement';
import { CategoriesManagement } from './pages/admin/CategoriesManagement';
import { RegistrationsManagement } from './pages/admin/RegistrationsManagement';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminProfile } from './pages/admin/AdminProfile';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserEventsPage } from './pages/user/UserEventsPage';
import { MyRegistrationsPage } from './pages/user/MyRegistrationsPage';
import { MyTasksPage } from './pages/user/MyTasksPage';
import { UserNotifications } from './pages/user/UserNotifications';
import { UserProfile } from './pages/user/UserProfile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/events" element={<PublicEventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Admin Panel Protected Routes (is_staff = True) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="tasks" element={<TasksManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="registrations" element={<RegistrationsManagement />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* User Panel Protected Routes (is_staff = False) */}
          <Route
            path="/user"
            element={
              <ProtectedRoute requireAdmin={false}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="events" element={<UserEventsPage />} />
            <Route path="registrations" element={<MyRegistrationsPage />} />
            <Route path="tasks" element={<MyTasksPage />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
