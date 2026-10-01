import React from 'react';
import { Calendar, ShieldCheck, Mail, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FDFDFE] border-t border-[#D6D9DF] text-[#8F9192]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3D766D] flex items-center justify-center text-[#FDFDFE] shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#1E252B]">
                Event<span className="text-[#3D766D]">&</span>Task Management System
              </span>
            </div>
            <p className="text-sm text-[#8F9192] max-w-sm">
              Role-based management system with Django REST Framework backend, SimpleJWT authentication, and interactive React frontend.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8F9192]">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#3D766D]" /> Django 5.1 + SimpleJWT
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#2D5851]" /> Console SMTP Backend
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E252B] mb-3">
              Application Roles
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-semibold text-[#3D766D]">Admin Panel:</span> User, Event, Task, Category, and Registration Management.
              </li>
              <li>
                <span className="font-semibold text-[#2D5851]">User Panel:</span> Event browsing, 1-click registration, and assigned task tracking.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E252B] mb-3">
              Security &amp; Flow
            </h4>
            <ul className="space-y-2 text-sm text-[#8F9192]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3D766D]" /> SimpleJWT Access &amp; Refresh Tokens
              </li>
              <li>Automatic Token Refresh on 401</li>
              <li>Role verification via <code className="text-[#3D766D] font-mono text-xs">is_staff</code></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#D6D9DF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8F9192] gap-3">
          <p>© {new Date().getFullYear()} Event &amp; Task Management System. Built with Django REST Framework &amp; React.</p>
          <div className="flex items-center gap-1 text-[#8F9192]">
            Flowchart Implementation Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};
