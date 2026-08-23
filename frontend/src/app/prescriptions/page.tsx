"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { prescriptionService, consultationService } from "@/services/api";
import { Prescription, Consultation } from "@/types";
import { ClipboardList, Printer, Pill, Plus, X, CheckCircle2 } from "lucide-react";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
    if (user?.role === "DOCTOR" || user?.role === "ADMIN") {
      consultationService.getAll().then(setConsultations).catch(console.error);
    }
  }, [user]);

  const fetchPrescriptions = () => {
    if (user?.role === "DOCTOR" || user?.role === "ADMIN" || user?.role === "RECEPTIONIST") {
      prescriptionService
        .getAll()
        .then((data) => {
          setPrescriptions(data);
          if (data.length > 0) setSelectedPrescription(data[0]);
        })
        .catch(console.error);
    } else {
      const patientId = user?.patientId || 1;
      prescriptionService
        .getByPatient(patientId)
        .then((data) => {
          setPrescriptions(data);
          if (data.length > 0) setSelectedPrescription(data[0]);
        })
        .catch(console.error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultationId) return;

    setIsSubmitting(true);
    try {
      const created = await prescriptionService.create({
        consultationId: Number(selectedConsultationId),
        notes,
        items,
      });

      setIsModalOpen(false);
      setSelectedConsultationId("");
      setNotes("");
      setItems([{ medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      fetchPrescriptions();
      setSelectedPrescription(created);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to issue prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescription Center</h1>
          <p className="text-sm text-slate-500 mt-1">Digital medical prescriptions & medication guidelines</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          {user?.role === "DOCTOR" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors print:hidden"
            >
              <Plus className="w-4 h-4" /> Issue New Prescription
            </button>
          )}

          {selectedPrescription && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" /> Print Prescription PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prescriptions List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3 print:hidden">
          <h2 className="text-base font-bold text-slate-800 mb-2">Prescription Records</h2>
          {prescriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No prescriptions found.</p>
          ) : (
            prescriptions.map((rx) => (
              <div
                key={rx.id}
                onClick={() => setSelectedPrescription(rx)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedPrescription?.id === rx.id
                    ? "bg-sky-50 border-sky-300 shadow-sm"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/80"
                }`}
              >
                <div className="font-bold text-xs text-slate-800">Patient: {rx.patientName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{rx.doctorName} ({rx.doctorSpecialization})</div>
                <div className="text-[10px] text-slate-400 mt-2 font-medium">
                  Issued: {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : new Date().toLocaleDateString("en-GB")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Prescription View Sheet */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 print:col-span-3 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
          {selectedPrescription ? (
            <div>
              {/* Header Letterhead */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-sky-700">MEDIFLOW HOSPITAL CLINIC</h3>
                  <p className="text-xs text-slate-500">100 Healthcare Boulevard, Suite 400</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-800">{selectedPrescription.doctorName}</div>
                  <div className="text-xs text-slate-500">{selectedPrescription.doctorSpecialization}</div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                  <span className="font-bold text-slate-800">{selectedPrescription.patientName}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block">Prescription Date</span>
                  <span className="font-bold text-slate-800">
                    {selectedPrescription.createdAt ? new Date(selectedPrescription.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : new Date().toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Medication Table */}
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Prescribed Medications</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl mb-6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPrescription.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                          <Pill className="w-3.5 h-3.5 text-sky-600" /> {item.medicineName}
                        </td>
                        <td className="p-3 text-slate-700">{item.dosage}</td>
                        <td className="p-3 text-slate-700">{item.frequency}</td>
                        <td className="p-3 text-slate-700">{item.duration}</td>
                        <td className="p-3 text-slate-500 italic">{item.instructions || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedPrescription.notes && (
                <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl text-xs text-amber-800">
                  <span className="font-bold block mb-1">Special Physician Instructions:</span>
                  {selectedPrescription.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">Select a prescription from the left menu to view</div>
          )}
        </div>
      </div>

      {/* Modal for Issuing New Prescription */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-sky-600" /> Issue New Patient Prescription
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Select Consultation Record</label>
                <select
                  value={selectedConsultationId}
                  onChange={(e) => setSelectedConsultationId(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="">-- Select Patient Consultation --</option>
                  {consultations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.patientName} - {c.diagnosis} ({new Date(c.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medication Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Prescribed Medications</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medication
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 relative">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Aspirin)"
                        value={item.medicineName}
                        onChange={(e) => handleItemChange(idx, "medicineName", e.target.value)}
                        required
                        className="p-2 border border-slate-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 100 mg)"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(idx, "dosage", e.target.value)}
                        required
                        className="p-2 border border-slate-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Twice daily)"
                        value={item.frequency}
                        onChange={(e) => handleItemChange(idx, "frequency", e.target.value)}
                        required
                        className="p-2 border border-slate-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 7 Days)"
                        value={item.duration}
                        onChange={(e) => handleItemChange(idx, "duration", e.target.value)}
                        required
                        className="p-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Special Instructions (e.g. Take after meals with plenty of water)"
                      value={item.instructions}
                      onChange={(e) => handleItemChange(idx, "instructions", e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Physician Special Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional physician advice or precautions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md"
                >
                  {isSubmitting ? "Issuing..." : "Issue & Save Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
