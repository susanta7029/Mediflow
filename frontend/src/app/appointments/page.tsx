"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { appointmentService, departmentService, doctorService, patientService } from "@/services/api";
import { Department, Doctor, Patient, Appointment } from "@/types";
import { Calendar as CalendarIcon, Clock, Stethoscope, AlertCircle, CheckCircle2, User, Plus, RefreshCw, UserPlus, X } from "lucide-react";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Booking Form Visibility & Mode
  const [showForm, setShowForm] = useState(user?.role !== "DOCTOR");
  const [bookingMode, setBookingMode] = useState<"FOLLOW_UP" | "REFERRAL" | "GENERAL">("GENERAL");

  // Booking Form State
  const [selectedDept, setSelectedDept] = useState<number | "">("");
  const [selectedDoctor, setSelectedDoctor] = useState<number | "">("");
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
    departmentService.getAll().then(setDepartments).catch(console.error);

    if (user?.role === "DOCTOR" || user?.role === "ADMIN" || user?.role === "RECEPTIONIST") {
      patientService.getAll().then(setPatients).catch(console.error);
    }
  }, [user]);

  const fetchAppointments = () => {
    appointmentService.getAll().then(setAppointments).catch(console.error);
  };

  const handleOpenFollowUp = () => {
    setBookingMode("FOLLOW_UP");
    setShowForm(true);
    setError("");
    setSuccessMessage("");
    setReason("Follow-up Consultation");

    if (user?.role === "DOCTOR" && user?.doctorId) {
      doctorService.getAll().then((allDocs) => {
        const myDoc = allDocs.find((d) => d.id === user.doctorId);
        if (myDoc) {
          setSelectedDept(myDoc.departmentId);
          setSelectedDoctor(myDoc.id);
        }
      }).catch(console.error);
    }
  };

  const handleOpenReferral = () => {
    setBookingMode("REFERRAL");
    setShowForm(true);
    setError("");
    setSuccessMessage("");
    setSelectedDept("");
    setSelectedDoctor("");
    setReason("Specialist Referral Consultation");
  };

  useEffect(() => {
    if (selectedDept) {
      doctorService.getAll(Number(selectedDept)).then((docs) => {
        setDoctors(docs);
        if (bookingMode === "FOLLOW_UP" && user?.role === "DOCTOR" && user?.doctorId && docs.some((d) => d.id === user.doctorId)) {
          setSelectedDoctor(user.doctorId);
        }
      }).catch(console.error);
      setAvailableSlots([]);
    }
  }, [selectedDept, user, bookingMode]);

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      appointmentService
        .getAvailableSlots(Number(selectedDoctor), appointmentDate)
        .then(setAvailableSlots)
        .catch(console.error);
      setSelectedSlot("");
    }
  }, [selectedDoctor, appointmentDate]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await appointmentService.book({
        patientId: selectedPatient ? Number(selectedPatient) : undefined,
        doctorId: Number(selectedDoctor),
        departmentId: Number(selectedDept),
        appointmentDate,
        timeSlot: selectedSlot,
        reason,
      });

      setSuccessMessage(
        bookingMode === "REFERRAL"
          ? "Patient referral appointment booked successfully!"
          : "Follow-up appointment scheduled successfully!"
      );
      setSelectedSlot("");
      setReason("");
      setSelectedPatient("");
      fetchAppointments();
      if (user?.role === "DOCTOR") {
        setTimeout(() => setShowForm(false), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to book appointment. Slot may already be reserved.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointment Management</h1>
          <p className="text-sm text-slate-500 mt-1">Book doctor consultations with real-time double-booking protection</p>
        </div>

        {/* Doctor Quick Action Buttons */}
        {user?.role === "DOCTOR" && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenFollowUp}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Schedule Patient Follow-Up
            </button>
            <button
              onClick={handleOpenReferral}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
            >
              <Stethoscope className="w-4 h-4" /> Refer Patient to Specialist
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Wizard Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {bookingMode === "REFERRAL" ? (
                  <>
                    <Stethoscope className="w-5 h-5 text-indigo-600" /> Specialist Referral
                  </>
                ) : bookingMode === "FOLLOW_UP" ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-sky-600" /> Patient Follow-Up Slot
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-sky-600" /> Book New Appointment
                  </>
                )}
              </h2>
              {user?.role === "DOCTOR" && (
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {/* Step 0: Select Patient */}
              {(user?.role === "DOCTOR" || user?.role === "ADMIN" || user?.role === "RECEPTIONIST") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Patient</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : "")}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.patientName} ({p.gender}, {p.bloodGroup})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 1: Select Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">1. Select Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Doctor */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">2. Select Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value ? Number(e.target.value) : "")}
                  disabled={!selectedDept}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.doctorName} ({doc.specialization}) - ${doc.consultationFee}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Date Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">3. Select Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Step 4: Time Slot Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">4. Available Time Slots</label>
                {!selectedDoctor ? (
                  <p className="text-xs text-slate-400">Select a doctor to view slots</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-amber-600 font-medium">No available slots on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                          selectedSlot === slot
                            ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason for visit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason for Visit</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Briefly describe visit reason or referral notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedSlot}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/20 transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? "Booking..."
                  : bookingMode === "REFERRAL"
                  ? "Confirm Referral Booking"
                  : bookingMode === "FOLLOW_UP"
                  ? "Confirm Follow-Up Booking"
                  : "Confirm & Book Slot"}
              </button>
            </form>
          </div>
        )}

        {/* Appointments List Table */}
        <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 transition-all duration-300`}>
          <h2 className="text-lg font-bold text-slate-800">Your Appointments Schedule</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No appointments scheduled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Patient / Doctor</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Date & Slot</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Queue Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="font-bold text-slate-800">{appt.patientName}</div>
                        <div className="text-slate-400 text-[11px]">{appt.doctorName}</div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-600">{appt.departmentName}</td>
                      <td className="py-3.5 text-slate-600">
                        <div>{appt.appointmentDate}</div>
                        <div className="text-[11px] text-slate-400">{appt.timeSlot}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            appt.status === "CONFIRMED"
                              ? "bg-sky-100 text-sky-700"
                              : appt.status === "CHECKED_IN"
                              ? "bg-indigo-100 text-indigo-700"
                              : appt.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-700"
                              : appt.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-sky-600">
                        {appt.queueNumber ? `Q-${appt.queueNumber}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
