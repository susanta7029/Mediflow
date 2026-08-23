"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/services/api";
import { Activity, Lock, Mail, ShieldAlert, UserCheck, UserPlus, Phone, User as UserIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [specialization, setSpecialization] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Email Validation
    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@domain.com)";
    }

    // Password Validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (isRegister) {
      // First Name
      if (!firstName.trim()) {
        errors.firstName = "First name is required";
      } else if (firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
      }

      // Last Name
      if (!lastName.trim()) {
        errors.lastName = "Last name is required";
      } else if (lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
      }

      // Phone Number
      if (phoneNumber.trim() && !/^[0-9+\-\s()]{7,15}$/.test(phoneNumber.trim())) {
        errors.phoneNumber = "Please enter a valid phone number (e.g. +1-555-0199 or 10 digits)";
      }

      // Doctor Specialization
      if (role === "DOCTOR" && !specialization.trim()) {
        errors.specialization = "Medical specialization is required for doctor accounts";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isRegister) {
        const data = await authService.register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          role,
          departmentId: role === "DOCTOR" ? Number(departmentId) : undefined,
          specialization: role === "DOCTOR" ? (specialization.trim() || "General Specialist") : undefined,
        });
        login(data);
        router.push("/dashboard");
      } else {
        const data = await authService.login({ email: email.trim(), password });
        login(data);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setError("");
    setFieldErrors({});
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 z-50 overflow-y-auto bg-slate-950">
      {/* Background with dark overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url('/hospital_bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-950/80 to-slate-900/70 backdrop-blur-[6px]" />

      <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative z-10 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/20 mb-3">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to MEDIFLOW</h1>
          <p className="text-xs text-slate-400 mt-1">Smart Hospital Workflow Management Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleTabSwitch(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister ? "bg-sky-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister ? "bg-sky-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Create New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3 text-xs">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                    placeholder="John"
                    className={`w-full bg-slate-800/80 border rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none ${
                      fieldErrors.firstName ? "border-rose-500" : "border-slate-700 focus:border-sky-500"
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                    }}
                    placeholder="Doe"
                    className={`w-full bg-slate-800/80 border rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none ${
                      fieldErrors.lastName ? "border-rose-500" : "border-slate-700 focus:border-sky-500"
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }}
                  placeholder="+1-555-0199 or 10 digits"
                  className={`w-full bg-slate-800/80 border rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none ${
                    fieldErrors.phoneNumber ? "border-rose-500" : "border-slate-700 focus:border-sky-500"
                  }`}
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Register Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                </select>
              </div>

              {/* Extra Doctor Fields */}
              {role === "DOCTOR" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Medical Department Category</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(Number(e.target.value))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value={1}>Cardiology (CARD)</option>
                      <option value={2}>Neurology (NEUR)</option>
                      <option value={3}>Pediatrics (PED)</option>
                      <option value={4}>Orthopedics (ORTH)</option>
                      <option value={5}>General Medicine (GEN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Specialization *</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => {
                        setSpecialization(e.target.value);
                        if (fieldErrors.specialization) setFieldErrors((prev) => ({ ...prev, specialization: "" }));
                      }}
                      placeholder="e.g. Interventional Cardiologist, Neurosurgeon"
                      className={`w-full bg-slate-800/80 border rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none ${
                        fieldErrors.specialization ? "border-rose-500" : "border-slate-700 focus:border-sky-500"
                      }`}
                    />
                    {fieldErrors.specialization && (
                      <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.specialization}</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`w-full bg-slate-800/80 border rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-slate-500 focus:outline-none ${
                  fieldErrors.email ? "border-rose-500" : "border-slate-700/80 focus:border-sky-500"
                }`}
                placeholder="user@example.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`w-full bg-slate-800/80 border rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-slate-500 focus:outline-none ${
                  fieldErrors.password ? "border-rose-500" : "border-slate-700/80 focus:border-sky-500"
                }`}
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Create Account & Log In
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" /> Sign In to Portal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
