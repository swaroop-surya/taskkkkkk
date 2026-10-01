import React from 'react';
import { Database, Layers, Mail, Workflow, CheckCircle2, Shield } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E252B] tracking-tight">
          About Event &amp; Task Management System
        </h1>
        <p className="text-sm sm:text-base text-[#8F9192]">
          A role-governed platform designed strictly according to the system flowchart specification.
        </p>
      </div>

      {/* Tech Stack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#FDFDFE] border border-[#D6D9DF] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1E252B]">Django REST Framework</h3>
          <p className="text-xs text-[#8F9192] leading-relaxed">
            Django 5.1 with SimpleJWT for secure access/refresh token rotation. PostgreSQL database support with SQLite local dev fallback.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FDFDFE] border border-[#D6D9DF] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1E252B]">React SPA + Vite + Tailwind</h3>
          <p className="text-xs text-[#8F9192] leading-relaxed">
            React 19 with client-side role guards, Axios HTTP interceptors with auto token refreshing, responsive modals, and clean dashboards.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FDFDFE] border border-[#D6D9DF] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3F1] text-[#3D766D] border border-[#D6D9DF] flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1E252B]">Console SMTP &amp; Django Signals</h3>
          <p className="text-xs text-[#8F9192] leading-relaxed">
            Automated signals generate real-time in-app notifications and dispatch console SMTP emails for registration, assignment, and status updates.
          </p>
        </div>
      </div>

      {/* Flow Breakdown */}
      <div className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] p-8 space-y-6 shadow-xs">
        <h2 className="text-xl font-bold text-[#1E252B] flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#3D766D]" />
          <span>Flowchart Architectural Specification</span>
        </h2>

        <div className="space-y-4 text-sm text-[#1E252B]">
          <div className="p-4 rounded-xl bg-[#F0F3F5] border border-[#D6D9DF] flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#EBF3F1] text-[#3D766D] font-bold text-xs mt-0.5 border border-[#D6D9DF]">
              1
            </div>
            <div>
              <strong className="text-[#1E252B]">Landing Page &amp; Registration:</strong>
              <p className="text-xs text-[#8F9192] mt-0.5">
                New accounts are created through the Register portal with <code className="text-[#3D766D] font-mono">is_staff=False</code> by default.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F0F3F5] border border-[#D6D9DF] flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#EBF3F1] text-[#3D766D] font-bold text-xs mt-0.5 border border-[#D6D9DF]">
              2
            </div>
            <div>
              <strong className="text-[#1E252B]">Unified Login:</strong>
              <p className="text-xs text-[#8F9192] mt-0.5">
                Single login endpoint accepts Email or Username + Password. Backend returns JWT access &amp; refresh tokens alongside the authenticated user profile.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F0F3F5] border border-[#D6D9DF] flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#EBF3F1] text-[#3D766D] font-bold text-xs mt-0.5 border border-[#D6D9DF]">
              3
            </div>
            <div>
              <strong className="text-[#1E252B]">Automated Role Routing:</strong>
              <p className="text-xs text-[#8F9192] mt-0.5">
                Frontend checks <code className="text-[#3D766D] font-mono">user.is_staff</code>. If true, routes to <strong>Admin Panel</strong> (/admin). If false, routes to <strong>User Panel</strong> (/user).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
