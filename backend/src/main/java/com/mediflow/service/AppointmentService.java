package com.mediflow.service;

import com.mediflow.dto.AppointmentDto;
import com.mediflow.dto.AppointmentRequest;
import com.mediflow.dto.AppointmentStatusUpdateRequest;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ConcurrencyException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.exception.UnauthorizedAccessException;
import com.mediflow.repository.*;
import com.mediflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final NotificationService notificationService;
    private final InvoiceService invoiceService;

    public static final List<String> STANDARD_SLOTS = List.of(
            "09:00 AM - 09:30 AM",
            "09:30 AM - 10:00 AM",
            "10:00 AM - 10:30 AM",
            "10:30 AM - 11:00 AM",
            "11:00 AM - 11:30 AM",
            "02:00 PM - 02:30 PM",
            "02:30 PM - 03:00 PM",
            "03:00 PM - 03:30 PM",
            "03:30 PM - 04:00 PM"
    );

    public List<String> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
        Set<String> bookedSlots = new HashSet<>();
        for (Appointment appt : bookedAppointments) {
            if (appt.getStatus() != AppointmentStatus.CANCELLED) {
                bookedSlots.add(appt.getTimeSlot());
            }
        }

        List<String> available = new ArrayList<>();
        for (String slot : STANDARD_SLOTS) {
            if (!bookedSlots.contains(slot)) {
                available.add(slot);
            }
        }
        return available;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AppointmentDto bookAppointment(AppointmentRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        Patient patient;

        if (currentUser.getRole() == Role.PATIENT) {
            patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient record not found for logged in user"));
        } else {
            if (request.getPatientId() == null) {
                throw new BadRequestException("Patient ID is required when booking as Admin or Receptionist");
            }
            patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        // Double Booking Check 1: Explicit DB check
        boolean alreadyBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                doctor.getId(), request.getAppointmentDate(), request.getTimeSlot(), AppointmentStatus.CANCELLED);

        if (alreadyBooked) {
            throw new ConcurrencyException("Selected time slot (" + request.getTimeSlot() + ") is already booked for Dr. " + doctor.getUser().getFullName() + ". Please pick another slot.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .department(department)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .status(AppointmentStatus.CONFIRMED)
                .reason(request.getReason())
                .build();

        try {
            // Double Booking Check 2: Guaranteed by unique constraint + optimistic versioning
            Appointment saved = appointmentRepository.save(appointment);

            // Auto-generate consultation fee invoice for patient
            try {
                com.mediflow.dto.InvoiceRequest invReq = com.mediflow.dto.InvoiceRequest.builder()
                        .patientId(patient.getId())
                        .appointmentId(saved.getId())
                        .dueDate(saved.getAppointmentDate().plusDays(7))
                        .build();
                invoiceService.createInvoice(invReq);
            } catch (Exception ignored) {}

            // Send notification to patient
            notificationService.createNotification(
                    patient.getUser(),
                    "Appointment Confirmed",
                    String.format("Your appointment with Dr. %s (%s) is confirmed for %s at %s.",
                            doctor.getUser().getFullName(), department.getName(), request.getAppointmentDate(), request.getTimeSlot()),
                    "APPOINTMENT"
            );

            return mapToDto(saved);
        } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrencyException("Double booking prevented: Time slot was reserved concurrently by another patient.");
        }
    }

    @Transactional
    public AppointmentDto updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        User currentUser = SecurityUtils.getCurrentUser();
        // Permission check
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
            if (!appointment.getPatient().getId().equals(patient.getId())) {
                throw new UnauthorizedAccessException("You are not authorized to update this appointment");
            }
        }

        appointment.setStatus(request.getStatus());
        if (request.getCancellationReason() != null) {
            appointment.setCancellationReason(request.getCancellationReason());
        }

        Appointment updated = appointmentRepository.save(appointment);

        // Notify patient on cancellation or confirmation
        notificationService.createNotification(
                updated.getPatient().getUser(),
                "Appointment Status Updated",
                String.format("Your appointment status has been updated to: %s", request.getStatus()),
                "APPOINTMENT"
        );

        return mapToDto(updated);
    }

    public List<AppointmentDto> getAppointmentsForCurrentUser() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient record not found"));
            return appointmentRepository.findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(patient.getId())
                    .stream().map(this::mapToDto).toList();
        } else if (currentUser.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor record not found"));
            return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(doctor.getId())
                    .stream().map(this::mapToDto).toList();
        } else {
            return appointmentRepository.findAll().stream().map(this::mapToDto).toList();
        }
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return mapToDto(appointment);
    }

    public AppointmentDto mapToDto(Appointment appt) {
        Optional<QueueEntry> queueOpt = queueEntryRepository.findByAppointmentId(appt.getId());

        return AppointmentDto.builder()
                .id(appt.getId())
                .patientId(appt.getPatient().getId())
                .patientName(appt.getPatient().getUser().getFullName())
                .patientPhone(appt.getPatient().getUser().getPhoneNumber())
                .doctorId(appt.getDoctor().getId())
                .doctorName("Dr. " + appt.getDoctor().getUser().getFullName())
                .departmentId(appt.getDepartment().getId())
                .departmentName(appt.getDepartment().getName())
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .status(appt.getStatus())
                .reason(appt.getReason())
                .cancellationReason(appt.getCancellationReason())
                .queueEntryId(queueOpt.map(QueueEntry::getId).orElse(null))
                .queueNumber(queueOpt.map(QueueEntry::getQueueNumber).orElse(null))
                .createdAt(appt.getCreatedAt())
                .build();
    }
}
