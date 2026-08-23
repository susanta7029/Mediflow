"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { appointmentService, doctorService, queueService } from "@/services/api";
import { Appointment, Doctor, QueueEntry } from "@/types";
import { Users, UserCheck, PhoneCall, CheckCircle2, Clock, Activity, Ticket, Stethoscope } from "lucide-react";

export default function QueuePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(user?.doctorId || 0);

  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    doctorService.getAll().then(setDoctors).catch(console.error);
  }, []);

  useEffect(() => {
    fetchQueueData();
  }, [selectedDoctorId]);

  const fetchQueueData = () => {
    setIsLoading(true);
    Promise.all([
      appointmentService.getAll(),
      queueService.getTodayQueue(selectedDoctorId),
    ])
      .then(([appts, queue]) => {
        setAppointments(appts);
        setQueueEntries(queue);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const handleCheckIn = async (appointmentId: number) => {
    setActionMessage("");
    try {
      const entry = await queueService.checkIn(appointmentId);
      setActionMessage(`Patient checked in! Generated Queue Token Q-${entry.queueNumber}`);
      fetchQueueData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCallNext = async () => {
    setActionMessage("");
    try {
      const entry = await queueService.callNext(selectedDoctorId);
      setActionMessage(`Now Calling: Patient ${entry.patientName} for ${entry.doctorName} (Token Q-${entry.queueNumber})`);
      fetchQueueData();
    } catch (err: any) {
      alert(err.response?.data?.message || "No waiting patients in queue");
    }
  };

  const handleStatusUpdate = async (queueId: number, status: string) => {
    try {
      await queueService.updateStatus(queueId, status);
      fetchQueueData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update queue status");
    }
  };

  const inRoomEntries = queueEntries.filter((q) => q.status === "IN_ROOM");
  const currentPatientInRoom =
    selectedDoctorId > 0
      ? inRoomEntries.find((q) => q.doctorId === selectedDoctorId)
      : inRoomEntries[inRoomEntries.length - 1] || inRoomEntries[0];
  const waitingCount =
    user?.role === "DOCTOR"
      ? queueEntries.filter((q) => q.status === "WAITING").length
      : appointments.filter((a) => a.status === "CHECKED_IN").length;

  const completedCount =
    user?.role === "DOCTOR"
      ? queueEntries.filter((q) => q.status === "COMPLETED").length
      : appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Real-Time Queue Management</h1>
          <p className="text-sm text-slate-500 mt-1">Live patient token call system and waiting room flow</p>
        </div>

        {(user?.role === "DOCTOR" || user?.role === "RECEPTIONIST") && (
          <div className="flex items-center gap-3">
            {user?.role === "RECEPTIONIST" && (
              <div className="relative">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-slate-700 font-medium text-xs rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none focus:border-sky-500 pr-8"
                >
                  <option value={0}>⚡ All Hospital Doctor Queues</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.doctorName} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleCallNext}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" /> Call Next Patient
            </button>
          </div>
        )}
      </div>

      {actionMessage && (
        <div className="p-4 bg-sky-50 border border-sky-200 text-sky-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Ticket className="w-4 h-4 text-sky-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Active Room & Queue Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Currently in Room Card */}
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Consultation Room
            </span>
            {currentPatientInRoom ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                IN PROGRESS
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                VACANT
              </span>
            )}
          </div>

          {currentPatientInRoom ? (
            <div className="space-y-2">
              <div className="text-4xl font-extrabold text-white">Q-{currentPatientInRoom.queueNumber}</div>
              <div className="text-sm font-semibold text-slate-200">{currentPatientInRoom.patientName}</div>
              <div className="text-xs text-slate-400">Doctor: {currentPatientInRoom.doctorName}</div>
              {user?.role === "DOCTOR" ? (
                <button
                  onClick={() => handleStatusUpdate(currentPatientInRoom.id, "COMPLETED")}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl w-full transition-colors"
                >
                  Mark Consultation Complete
                </button>
              ) : (
                <div className="mt-3 text-[11px] font-medium text-emerald-400">
                  Patient currently inside doctor consultation room
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">No patient currently inside consultation room</div>
          )}
        </div>

        {/* Waiting Count */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patients Waiting</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{waitingCount}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Today</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{completedCount}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Receptionist Quick Check-in List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Today's Appointment Check-in Queue</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Patient</th>
                <th className="pb-3">Doctor</th>
                <th className="pb-3">Time Slot</th>
                <th className="pb-3">Appointment Status</th>
                <th className="pb-3">Queue Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-800">{appt.patientName}</td>
                  <td className="py-3.5 text-slate-600">{appt.doctorName}</td>
                  <td className="py-3.5 text-slate-600">{appt.timeSlot}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        appt.status === "CONFIRMED"
                          ? "bg-sky-100 text-sky-700"
                          : appt.status === "CHECKED_IN"
                          ? "bg-indigo-100 text-indigo-700"
                          : appt.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {appt.status === "CONFIRMED" ? (
                      <button
                        onClick={() => handleCheckIn(appt.id)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] rounded-lg transition-colors shadow-sm"
                      >
                        Check In & Generate Token
                      </button>
                    ) : appt.queueNumber ? (
                      <span className="font-bold text-sky-600 text-xs">Token Q-{appt.queueNumber}</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
