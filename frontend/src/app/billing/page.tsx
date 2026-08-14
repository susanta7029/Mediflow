"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { invoiceService } from "@/services/api";
import { Invoice } from "@/types";
import { CreditCard, CheckCircle2, DollarSign, Receipt, Printer, ShieldCheck, FileText } from "lucide-react";

export default function BillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewReceiptInvoice, setViewReceiptInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === "DOCTOR") {
      window.location.href = "/dashboard";
      return;
    }
    fetchInvoices();
  }, [user]);

  const fetchInvoices = () => {
    if (user?.role === "PATIENT") {
      const patientId = user.patientId || 1;
      invoiceService.getByPatient(patientId).then(setInvoices).catch(console.error);
    } else {
      invoiceService.getAll().then(setInvoices).catch(console.error);
    }
  };

  const handlePayInvoice = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    setPaymentSuccess(false);

    try {
      await invoiceService.pay(selectedInvoice.id, {
        paymentMethod,
        transactionId: "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
      setPaymentSuccess(true);
      fetchInvoices();
      setTimeout(() => {
        setSelectedInvoice(null);
        setPaymentSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
        <p className="text-sm text-slate-500 mt-1">Manage consultation fee invoices, patient billing receipts, and payments</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 print:hidden">
        <h2 className="text-lg font-bold text-slate-800">Invoice & Payment History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Invoice Number</th>
                <th className="pb-3">Patient Name</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-sky-600 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" /> {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 text-slate-800 font-medium">{inv.patientName}</td>
                  <td className="py-3.5 font-extrabold text-slate-900">${inv.totalAmount.toFixed(2)}</td>
                  <td className="py-3.5 text-slate-500">{inv.dueDate}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : inv.status === "ISSUED"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      {inv.status === "ISSUED" && (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-colors shadow-sm flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay Invoice
                        </button>
                      )}
                      <button
                        onClick={() => setViewReceiptInvoice(inv)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" /> View Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Payment Gateway Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Checkout Payment</h3>
                <p className="text-xs text-slate-500">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-lg text-slate-800">Payment Successful!</h4>
                <p className="text-xs text-slate-500">Transaction ID recorded in system.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Total Amount Due</span>
                  <span className="text-2xl font-extrabold text-slate-900">${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Select Payment Gateway</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["CREDIT_CARD", "UPI", "STRIPE_MOCK"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-2.5 rounded-xl text-[11px] font-bold border text-center transition-all ${
                          paymentMethod === method
                            ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {method.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-[11px] text-sky-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Secure instant payment gateway processing</span>
                </div>

                <button
                  onClick={handlePayInvoice}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Processing Payment..." : `Pay $${selectedInvoice.totalAmount.toFixed(2)} Now`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Printable Hospital Receipt Modal & Print View */}
      {viewReceiptInvoice && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 print:shadow-none print:border-none print:max-w-none print:p-0">
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" /> Official Hospital Payment Receipt
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Receipt PDF
                </button>
                <button
                  onClick={() => setViewReceiptInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Formal Hospital Receipt Sheet */}
            <div className="space-y-6 font-sans text-slate-800">
              {/* Hospital Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-sky-600 pb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-sky-700 tracking-tight">MEDIFLOW HEALTHCARE CLINIC</h1>
                  <p className="text-xs text-slate-500 mt-1">100 Healthcare Boulevard, Suite 400 • Phone: (555) 019-2834</p>
                  <p className="text-xs text-slate-400">GSTIN / Medical License: MEDI-9921-X4</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    {viewReceiptInvoice.status === "PAID" ? "PAID RECEIPT" : "TAX INVOICE"}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 font-bold">{viewReceiptInvoice.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-400">Date: {viewReceiptInvoice.createdAt ? new Date(viewReceiptInvoice.createdAt).toLocaleDateString() : viewReceiptInvoice.dueDate}</p>
                </div>
              </div>

              {/* Patient & Payment Details Grid */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl text-xs border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Billed To Patient:</span>
                  <p className="font-bold text-sm text-slate-900">{viewReceiptInvoice.patientName}</p>
                  <p className="text-slate-500">Patient ID: PAT-{viewReceiptInvoice.patientId}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-400 block mb-1">Payment Method:</span>
                  <p className="font-bold text-sm text-slate-900">{viewReceiptInvoice.paymentMethod || "Pending"}</p>
                  <p className="text-slate-500">Txn Ref: {viewReceiptInvoice.paymentTransactionId || "N/A"}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewReceiptInvoice.items && viewReceiptInvoice.items.length > 0 ? (
                    viewReceiptInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-bold">${item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 font-semibold text-slate-800">Doctor Consultation & Clinical Service Fee</td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right">${viewReceiptInvoice.amount.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold">${viewReceiptInvoice.amount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1">
                <div className="flex justify-between w-48 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${viewReceiptInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-slate-600">
                  <span>Tax (10% GST/VAT):</span>
                  <span className="font-semibold">${viewReceiptInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2 mt-1">
                  <span>Total Paid:</span>
                  <span className="text-sky-700">${viewReceiptInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-500">Thank you for choosing MEDIFLOW Healthcare Clinic</p>
                <p>This is a computer-generated official receipt. No physical signature required.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
