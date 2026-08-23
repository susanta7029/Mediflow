"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { notificationService } from "@/services/api";
import { Notification } from "@/types";
import { Bell, LogOut, Check, Menu } from "lucide-react";

interface NavbarProps {
  onToggleMobile?: () => void;
}

export default function Navbar({ onToggleMobile }: NavbarProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      notificationService
        .getAll()
        .then(setNotifications)
        .catch((err) => console.error("Failed to load notifications", err));
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: number) => {
    notificationService.markRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    });
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-sm print:hidden">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate">
          Hospital Operations Portal
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl text-xs transition-colors border ${
                        n.isRead ? "bg-slate-50 border-slate-100 text-slate-600" : "bg-sky-50/60 border-sky-100 text-slate-800 font-medium"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-sky-600 hover:text-sky-700 p-0.5 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-slate-500 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-100 text-sky-700 font-bold text-xs sm:text-sm flex items-center justify-center border border-sky-200 shrink-0">
            {user.firstName ? user.firstName[0] : "U"}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">{user.fullName}</div>
            <div className="text-[11px] text-slate-500">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
