"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { appointmentService, consultationService, aiService } from "@/services/api";
import { Appointment, Consultation } from "@/types";
import { Stethoscope, Sparkles, FileText, CheckCircle2, AlertCircle, Activity, Heart, Thermometer, ShieldCheck } from "lucide-react";

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedApptId, setSelectedApptId] = useState<number | "">("");

  // Standard Medical ICD-10 Codes
  const icd10Codes = [
    { code: "I10", label: "I10 - Essential (Primary) Hypertension" },
    { code: "J20.9", label: "J20.9 - Acute Bronchitis, Unspecified" },
    { code: "E11.9", label: "E11.9 - Type 2 Diabetes Mellitus" },
    { code: "J06.9", label: "J06.9 - Acute Upper Respiratory Infection" },
    { code: "M54.5", label: "M54.5 - Low Back Pain, Unspecified" },
    { code: "R51.9", label: "R51.9 - Headache & Migraine Aura" },
  ];

  // Vitals State
  const [bp, setBp] = useState("120/80 mmHg");
  const [pulse, setPulse] = useState("72 bpm");
  const [temp, setTemp] = useState("98.6 °F");
  const [spo2, setSpo2] = useState("99%");
  const [respRate, setRespRate] = useState("16 /min");

  // Form State
  const [symptoms, setSymptoms] = useState("");
  const [observations, setObservations] = useState("");
  const [selectedIcd, setSelectedIcd] = useState("I10");
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [aiSummary, setAiSummary] = useState("");

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.role === "RECEPTIONIST") {
      window.location.href = "/dashboard";
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = () => {
    appointmentService.getAll().then(setAppointments).catch(console.error);
    if (user?.role === "DOCTOR" || user?.role === "ADMIN") {
      consultationService.getAll().then(setConsultations).catch(console.error);
    } else {
      const patientId = user?.patientId || 1;
      consultationService.getByPatient(patientId).then(setConsultations).catch(console.error);
    }
  };

  const handleGenerateAISummary = async () => {
    const activeDiagnosis = customDiagnosis || icd10Codes.find((c) => c.code === selectedIcd)?.label || "Clinical Evaluation";
    setIsGeneratingAI(true);
    try {
      const summaryText = await aiService.generateConsultationSummary({
        symptoms,
        observations: `[VITALS] BP: ${bp}, Pulse: ${pulse}, Temp: ${temp}, SpO2: ${spo2}, RR: ${respRate} | ${observations}`,
        diagnosis: activeDiagnosis,
        treatmentNotes: treatmentPlan,
      });
      setAiSummary(summaryText);
    } catch (err: any) {
      console.error(err);
      alert("AI summary generation failed");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptId) return;

    setIsSubmitting(true);
    setMessage("");

    const activeDiagnosis = customDiagnosis || icd10Codes.find((c) => c.code === selectedIcd)?.label || "Essential Hypertension";
    const fullObservations = `[VITALS] BP: ${bp}, Pulse: ${pulse}, Temp: ${temp}, SpO2: ${spo2}, RR: ${respRate} | ${observations}`;

    try {
      await consultationService.create({
        appointmentId: Number(selectedApptId),
        symptoms,
        observations: fullObservations,
        diagnosis: activeDiagnosis,
        treatmentPlan,
        followUpDate: followUpDate || undefined,
        aiSummary,
      });

      setMessage("Clinical consultation record saved successfully!");
      setSymptoms("");
      setObservations("");
      setCustomDiagnosis("");
      setTreatmentPlan("");
      setAiSummary("");
      setSelectedApptId("");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save consultation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Clinical Consultation EMR</h1>
        <p className="text-sm text-slate-500 mt-1">Doctor EMR clinical documentation, ICD-10 coding, vital signs tracker & AI summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Consultation Writer */}
        {user?.role === "DOCTOR" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" /> New Clinical SOAP Notes
            </h2>

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {message}
              </div>
            )}

            <form onSubmit={handleSubmitConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient Appointment</label>
                <select
                  value={selectedApptId}
                  onChange={(e) => setSelectedApptId(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="">-- Choose Patient Appointment --</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} ({a.timeSlot}) - {a.reason || "General"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Vital Signs Entry */}
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-600" /> Clinical Vital Signs
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Blood Pressure</span>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="120/80 mmHg"
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Heart Rate / Pulse</span>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="72 bpm"
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Body Temperature</span>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="98.6 °F"
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Oxygen (SpO2)</span>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="99%"
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subjective Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={2}
                  placeholder="Patient presenting complaints & history of illness..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Objective Exam & Observations</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={2}
                  placeholder="Physical examination, heart/lung auscultation..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              {/* ICD-10 Primary Diagnosis Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Primary ICD-10 Diagnosis Code</label>
                <select
                  value={selectedIcd}
                  onChange={(e) => setSelectedIcd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 mb-1"
                >
                  {icd10Codes.map((icd) => (
                    <option key={icd.code} value={icd.code}>
                      {icd.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={customDiagnosis}
                  onChange={(e) => setCustomDiagnosis(e.target.value)}
                  placeholder="Or enter custom diagnosis..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Treatment Plan & Lab Orders</label>
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  rows={2}
                  placeholder="Medication regimen, dietary advice, follow-up..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              {/* AI Auto-Summary Feature */}
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" /> AI Clinical Summary Note
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingAI}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] rounded-lg transition-colors"
                  >
                    {isGeneratingAI ? "Generating..." : "Generate AI Summary"}
                  </button>
                </div>
                {aiSummary && (
                  <textarea
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2 text-xs text-slate-800"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedApptId}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? "Saving..." : "Save EMR Consultation Record"}
              </button>
            </form>
          </div>
        )}

        {/* Consultation History */}
        <div className={`${user?.role === "DOCTOR" ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4`}>
          <h2 className="text-lg font-bold text-slate-800">Consultation History & Medical Notes</h2>

          {consultations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No consultation records found.</p>
          ) : (
            <div className="space-y-4">
              {consultations.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{c.diagnosis}</h4>
                      <p className="text-xs text-slate-500">
                        Patient: {c.patientName} • Attending Doctor: {c.doctorName}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">Symptoms:</span>
                      <p className="text-slate-700">{c.symptoms || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">Vitals & Clinical Observations:</span>
                      <p className="text-slate-700">{c.observations || "N/A"}</p>
                    </div>
                  </div>

                  {c.aiSummary && (
                    <div className="p-3 bg-sky-50/80 border border-sky-100 rounded-xl text-xs text-slate-700">
                      <span className="font-bold text-sky-700 block mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Clinical Summary:
                      </span>
                      {c.aiSummary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
