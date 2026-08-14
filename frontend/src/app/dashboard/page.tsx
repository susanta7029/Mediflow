"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { dashboardService } from "@/services/api";
import { DashboardStats } from "@/types";
import {
  Users,
  UserCheck,
  Calendar,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  Stethoscope,
  TrendingUp,
  ClipboardList,
  Plus,
  CreditCard,
  Bot,
  ChevronRight,
  PhoneCall,
  FileText,
  Activity,
  Ticket,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load dashboard stats", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  const role = user?.role || "PATIENT";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl rounded-l-full pointer-events-none"></div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-medium backdrop-blur-md mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> MEDIFLOW Command Center
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            {role === "ADMIN" && "Real-time overview of hospital performance, doctor schedules, patient counts, and revenue analytics."}
            {role === "DOCTOR" && "Track today's patient queue, active consultations, and pending follow-ups."}
            {role === "RECEPTIONIST" && "Manage patient check-ins, appointment schedules, and waiting room queue flow."}
            {role === "PATIENT" && "View your upcoming appointments, prescription records, and active medical billing."}
          </p>
        </div>
      </div>

      {/* Role-tailored Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {role === "PATIENT" ? "My Appointments" : role === "DOCTOR" ? "My Today Appointments" : role === "RECEPTIONIST" ? "Today's Appointments" : "Total Patients"}
            </p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {role === "PATIENT"
                ? stats?.recentAppointments?.length || 0
                : role === "DOCTOR" || role === "RECEPTIONIST"
                ? stats?.todayAppointments || 0
                : stats?.totalPatients || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            {role === "PATIENT" || role === "DOCTOR" || role === "RECEPTIONIST" ? <Calendar className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {role === "PATIENT" ? "Upcoming Visits" : role === "DOCTOR" ? "Patients Waiting Queue" : role === "RECEPTIONIST" ? "Active Queue Tokens" : "Active Doctors"}
            </p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {role === "PATIENT"
                ? stats?.recentAppointments?.filter((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN").length || 0
                : role === "DOCTOR"
                ? stats?.recentAppointments?.filter((a) => a.status === "CHECKED_IN").length || 0
                : role === "RECEPTIONIST"
                ? stats?.recentAppointments?.filter((a) => a.status === "CHECKED_IN" || a.status === "IN_PROGRESS").length || 0
                : stats?.totalDoctors || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {role === "PATIENT" || role === "DOCTOR" || role === "RECEPTIONIST" ? <Clock className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {role === "DOCTOR" ? "My Completed Today" : role === "PATIENT" ? "Visits Completed" : role === "RECEPTIONIST" ? "Completed Consultations" : "Today's Appointments"}
            </p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {role === "PATIENT"
                ? stats?.recentAppointments?.filter((a) => a.status === "COMPLETED").length || 0
                : stats?.completedConsultations || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            {role === "PATIENT" || role === "DOCTOR" || role === "RECEPTIONIST" ? <CheckCircle2 className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {role === "DOCTOR"
                ? "Total Patients Seen"
                : role === "PATIENT"
                ? "Active Prescriptions"
                : "Total Hospital Revenue"}
            </p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {role === "DOCTOR"
                ? stats?.recentAppointments?.length || 0
                : role === "PATIENT"
                ? stats?.recentAppointments?.filter((a) => a.status === "COMPLETED").length || 0
                : `$${(stats?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            {role === "PATIENT" ? (
              <ClipboardList className="w-6 h-6" />
            ) : role === "DOCTOR" ? (
              <Stethoscope className="w-6 h-6" />
            ) : (
              <DollarSign className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* Analytics & Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section */}
        {role === "PATIENT" ? (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Patient Healthcare Portal Actions</h3>
            <p className="text-xs text-slate-400">Quick shortcuts to manage your visits, prescriptions, and medical bills</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                href="/appointments"
                className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 hover:bg-sky-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Book Doctor Consultation</h4>
                    <p className="text-xs text-slate-500">Pick a doctor and schedule a time slot</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/prescriptions"
                className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">My Prescriptions</h4>
                    <p className="text-xs text-slate-500">View medications & print letterhead PDF</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/billing"
                className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Pay Invoices & Bills</h4>
                    <p className="text-xs text-slate-500">Review consultation bills & checkout</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/ai-assistant"
                className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 hover:bg-purple-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">AI Symptom Assistant</h4>
                    <p className="text-xs text-slate-500">Ask medical questions & guidance</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : role === "DOCTOR" ? (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Doctor Clinical Command Shortcuts</h3>
            <p className="text-xs text-slate-400">Direct clinical workflows for consultations, prescriptions, and queue calling</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                href="/consultations"
                className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 hover:bg-sky-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Document Consultation</h4>
                    <p className="text-xs text-slate-500">Record symptoms, diagnosis & AI summary</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/prescriptions"
                className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Issue Medication Rx</h4>
                    <p className="text-xs text-slate-500">Prescribe drugs & print letterhead PDF</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/queue"
                className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Call Waiting Queue Token</h4>
                    <p className="text-xs text-slate-500">Call next patient into consultation room</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/ai-assistant"
                className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 hover:bg-purple-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">AI Clinical Reference</h4>
                    <p className="text-xs text-slate-500">Medical guidelines & differential diagnosis</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : role === "RECEPTIONIST" ? (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Front Desk Operations Shortcuts</h3>
            <p className="text-xs text-slate-400">Direct front desk tools for patient check-in, scheduling, and billing</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                href="/queue"
                className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 hover:bg-sky-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Check In Patients & Tokens</h4>
                    <p className="text-xs text-slate-500">Check in arriving patients & issue tokens</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/appointments"
                className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Book Walk-In Appointment</h4>
                    <p className="text-xs text-slate-500">Schedule appointments for front desk patients</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/billing"
                className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Collect Billing & Payments</h4>
                    <p className="text-xs text-slate-500">Process consultation fees & issue receipts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/ai-assistant"
                className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 hover:bg-purple-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Front Desk AI Assistant</h4>
                    <p className="text-xs text-slate-500">Hospital FAQs & patient queue support</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Department Case Volumes</h3>
                <p className="text-xs text-slate-400">Total appointments booked by medical department</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.departmentStats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" }}
                  />
                  <Bar dataKey="appointmentCount" fill="#0284c7" radius={[6, 6, 0, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Appointments List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg">
              {role === "PATIENT"
                ? "Your Scheduled Visits"
                : role === "DOCTOR"
                ? "My Patient Schedule Today"
                : role === "RECEPTIONIST"
                ? "Today's Master Schedule"
                : "Recent Appointments"}
            </h3>
          </div>
          <div className="space-y-3">
            {stats?.recentAppointments?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No appointments recorded yet.</p>
            ) : (
              stats?.recentAppointments?.map((appt) => (
                <div key={appt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-800">{appt.patientName}</div>
                    <div className="text-[11px] text-slate-500">{appt.doctorName} • {appt.timeSlot}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      appt.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700"
                        : appt.status === "IN_PROGRESS"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
