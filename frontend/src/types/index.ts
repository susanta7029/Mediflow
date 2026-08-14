export type Role = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type QueueStatus = 'WAITING' | 'IN_ROOM' | 'COMPLETED' | 'SKIPPED';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
  isActive: boolean;
  doctorId?: number;
  patientId?: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface Doctor {
  id: number;
  userId: number;
  doctorName: string;
  email: string;
  phoneNumber?: string;
  departmentId: number;
  departmentName: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  consultationFee: number;
  bio?: string;
  availableDays?: string;
}

export interface Patient {
  id: number;
  userId: number;
  patientName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistorySummary?: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorId: number;
  doctorName: string;
  departmentId: number;
  departmentName: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  reason?: string;
  cancellationReason?: string;
  queueEntryId?: number;
  queueNumber?: number;
  createdAt: string;
}

export interface QueueEntry {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  queueNumber: number;
  status: QueueStatus;
  checkInTime: string;
  calledTime?: string;
  completedTime?: string;
}

export interface PrescriptionItem {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  notes?: string;
  items: PrescriptionItem[];
  createdAt: string;
}

export interface Consultation {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  symptoms?: string;
  observations?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  aiSummary?: string;
  prescription?: Prescription;
  createdAt: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
}

export interface Invoice {
  id: number;
  patientId: number;
  patientName: string;
  appointmentId?: number;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  completedConsultations: number;
  totalRevenue: number;
  recentAppointments: Appointment[];
  activeQueue: QueueEntry[];
  departmentStats: { name: string; doctorCount: number; appointmentCount: number }[];
}
