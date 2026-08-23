import "./globals.css";
import React from "react";
import { AuthProvider } from "@/lib/auth-context";
import QueryProvider from "@/components/QueryProvider";
import ClientAppLayout from "@/components/ClientAppLayout";

export const metadata = {
  title: "MEDIFLOW — Smart Hospital Workflow Management Platform",
  description: "Production-grade SaaS platform for hospital appointments, real-time queues, clinical consultations, AI summaries, and billing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased">
        <QueryProvider>
          <AuthProvider>
            <ClientAppLayout>{children}</ClientAppLayout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
