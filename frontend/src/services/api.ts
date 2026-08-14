import api from "@/lib/axios";
import {
  ApiResponse,
  AuthResponse,
  Department,
  Doctor,
  Patient,
  Appointment,
  QueueEntry,
  Consultation,
  Prescription,
  Invoice,
  Notification,
  DashboardStats,
  AuditLog,
} from "@/types";

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
    return res.data.data;
  },
  register: async (data: any) => {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data.data;
  },
  me: async () => {
    const res = await api.get<ApiResponse<any>>("/auth/me");
    return res.data.data;
  },
};

export const departmentService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Department[]>>("/departments");
    return res.data.data;
  },
};

export const doctorService = {
  getAll: async (departmentId?: number) => {
    const res = await api.get<ApiResponse<Doctor[]>>("/doctors", {
      params: { departmentId },
    });
    return res.data.data;
  },
};

export const patientService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Patient[]>>("/patients");
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return res.data.data;
  },
};

export const appointmentService = {
  getAvailableSlots: async (doctorId: number, date: string) => {
    const res = await api.get<ApiResponse<string[]>>("/appointments/available-slots", {
      params: { doctorId, date },
    });
    return res.data.data;
  },
  book: async (data: any) => {
    const res = await api.post<ApiResponse<Appointment>>("/appointments", data);
    return res.data.data;
  },
  getAll: async () => {
    const res = await api.get<ApiResponse<Appointment[]>>("/appointments");
    return res.data.data;
  },
  updateStatus: async (id: number, status: string, cancellationReason?: string) => {
    const res = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/status`, {
      status,
      cancellationReason,
    });
    return res.data.data;
  },
};

export const queueService = {
  checkIn: async (appointmentId: number) => {
    const res = await api.post<ApiResponse<QueueEntry>>(`/queue/check-in/${appointmentId}`);
    return res.data.data;
  },
  callNext: async (doctorId: number) => {
    const res = await api.post<ApiResponse<QueueEntry>>(`/queue/call-next/${doctorId}`);
    return res.data.data;
  },
  updateStatus: async (queueId: number, status: string) => {
    const res = await api.put<ApiResponse<QueueEntry>>(`/queue/${queueId}/status?status=${status}`);
    return res.data.data;
  },
  getTodayQueue: async (doctorId: number) => {
    const res = await api.get<ApiResponse<QueueEntry[]>>(`/queue/today/${doctorId}`);
    return res.data.data;
  },
};

export const consultationService = {
  create: async (data: any) => {
    const res = await api.post<ApiResponse<Consultation>>("/consultations", data);
    return res.data.data;
  },
  getAll: async () => {
    const res = await api.get<ApiResponse<Consultation[]>>("/consultations");
    return res.data.data;
  },
  getByPatient: async (patientId: number) => {
    const res = await api.get<ApiResponse<Consultation[]>>(`/consultations/patient/${patientId}`);
    return res.data.data;
  },
};

export const prescriptionService = {
  create: async (data: any) => {
    const res = await api.post<ApiResponse<Prescription>>("/prescriptions", data);
    return res.data.data;
  },
  getAll: async () => {
    const res = await api.get<ApiResponse<Prescription[]>>("/prescriptions");
    return res.data.data;
  },
  getByPatient: async (patientId: number) => {
    const res = await api.get<ApiResponse<Prescription[]>>(`/prescriptions/patient/${patientId}`);
    return res.data.data;
  },
};

export const invoiceService = {
  create: async (data: any) => {
    const res = await api.post<ApiResponse<Invoice>>("/invoices", data);
    return res.data.data;
  },
  pay: async (id: number, paymentData: any) => {
    const res = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/pay`, paymentData);
    return res.data.data;
  },
  getAll: async () => {
    const res = await api.get<ApiResponse<Invoice[]>>("/invoices");
    return res.data.data;
  },
  getByPatient: async (patientId: number) => {
    const res = await api.get<ApiResponse<Invoice[]>>(`/invoices/patient/${patientId}`);
    return res.data.data;
  },
};

export const aiService = {
  generateConsultationSummary: async (data: any) => {
    const res = await api.post<ApiResponse<string>>("/ai/consultation-summary", data);
    return res.data.data;
  },
  summarizeDocument: async (data: any) => {
    const res = await api.post<ApiResponse<string>>("/ai/document-summary", data);
    return res.data.data;
  },
  parseAppointmentAssist: async (query: string) => {
    const res = await api.post<ApiResponse<any>>("/ai/appointment-assist", { query });
    return res.data.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return res.data.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Notification[]>>("/notifications");
    return res.data.data;
  },
  markRead: async (id: number) => {
    await api.put(`/notifications/${id}/read`);
  },
};

export const auditService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<AuditLog[]>>("/audit-logs");
    return res.data.data;
  },
};
