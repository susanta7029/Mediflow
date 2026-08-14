"use client";

import React, { useState } from "react";
import { aiService, appointmentService } from "@/services/api";
import { Bot, Sparkles, FileText, Search, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AIAssistantPage() {
  // Feature 1: Medical Document Summarizer
  const [docContent, setDocContent] = useState("");
  const [docType, setDocType] = useState("LAB_REPORT");
  const [docSummary, setDocSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Feature 2: Natural Language Appointment Search Parser
  const [nlQuery, setNlQuery] = useState("I need to see a cardiologist next Monday afternoon");
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleSummarizeDoc = async () => {
    if (!docContent) return;
    setIsSummarizing(true);
    try {
      const res = await aiService.summarizeDocument({
        documentContent: docContent,
        documentType: docType,
      });
      setDocSummary(res);
    } catch (err: any) {
      alert("Failed to summarize document");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleParseQuery = async () => {
    if (!nlQuery) return;
    setIsParsing(true);
    try {
      const parsed = await aiService.parseAppointmentAssist(nlQuery);
      setParsedResult(parsed);
    } catch (err: any) {
      alert("Failed to parse query");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">AI Clinical Assistant</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Administrative documentation assistant for summaries and natural language appointment queries.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <Bot className="w-10 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 1: Document Summarizer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" /> Medical Document Summarizer
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              >
                <option value="LAB_REPORT">Lab Blood Test Report</option>
                <option value="DISCHARGE_SUMMARY">Hospital Discharge Summary</option>
                <option value="RADIOLOGY">Radiology & X-Ray Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Paste Medical Report Text</label>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                rows={5}
                placeholder="Paste lab values, discharge notes, or radiology text here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSummarizeDoc}
              disabled={isSummarizing || !docContent}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {isSummarizing ? "Summarizing..." : "Summarize Report Text"}
            </button>

            {docSummary && (
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="font-bold text-xs text-sky-800 block">AI Summary Output:</span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{docSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature 2: Natural Language Appointment Assistant */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" /> Natural Language Slot Finder
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Enter your request in plain English</label>
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                placeholder="e.g., I need a pediatrician tomorrow morning"
              />
            </div>

            <button
              onClick={handleParseQuery}
              disabled={isParsing || !nlQuery}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" /> {isParsing ? "Parsing Intent..." : "Find Slots from Natural Language"}
            </button>

            {parsedResult && (
              <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3 text-xs">
                <span className="font-bold text-indigo-900 block">AI Extracted Intent:</span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-400 block">Department</span>
                    <span className="font-bold text-slate-900">{parsedResult.extractedDepartment}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">Target Date</span>
                    <span className="font-bold text-slate-900">{parsedResult.extractedDate}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">Time Range</span>
                    <span className="font-bold text-slate-900">{parsedResult.extractedTimeRange}</span>
                  </div>
                </div>

                <a
                  href="/appointments"
                  className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Proceed to Book Matching Slot <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
