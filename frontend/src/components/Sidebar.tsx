"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  ClipboardList,
  CreditCard,
  Bot,
  Activity,
  X,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"] },
    { label: "Appointments", href: "/appointments", icon: Calendar, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"] },
    { label: "Queue Management", href: "/queue", icon: Users, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"] },
    { label: "Consultations", href: "/consultations", icon: Stethoscope, roles: ["ADMIN", "DOCTOR", "PATIENT"] },
    { label: "Prescriptions", href: "/prescriptions", icon: ClipboardList, roles: ["ADMIN", "DOCTOR", "PATIENT"] },
    { label: "Billing & Invoices", href: "/billing", icon: CreditCard, roles: ["ADMIN", "RECEPTIONIST", "PATIENT"] },
    { label: "AI Clinical Assistant", href: "/ai-assistant", icon: Bot, roles: ["ADMIN", "DOCTOR", "PATIENT", "RECEPTIONIST"] },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 print:hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">MEDIFLOW</h1>
            <p className="text-xs text-slate-400 font-medium">Smart Hospital Workflow</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Profile Badge */}
      <div className="px-6 py-3.5 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between">
        <span className="font-semibold text-white truncate text-sm">{user.fullName}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!item.roles.includes(role)) return null;

          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        MEDIFLOW v1.0.0 &copy; 2026
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
