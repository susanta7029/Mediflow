package com.mediflow.service;

import com.mediflow.dto.ConsultationDto;
import com.mediflow.dto.ConsultationRequest;
import com.mediflow.dto.PrescriptionDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PrescriptionService prescriptionService;
    private final NotificationService notificationService;

    @Transactional
    public ConsultationDto createConsultation(ConsultationRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + request.getAppointmentId()));

        if (consultationRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new BadRequestException("Consultation record already exists for this appointment");
        }

        Consultation consultation = Consultation.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .symptoms(request.getSymptoms())
                .observations(request.getObservations())
                .diagnosis(request.getDiagnosis())
                .treatmentPlan(request.getTreatmentPlan())
                .followUpDate(request.getFollowUpDate())
                .aiSummary(request.getAiSummary())
                .build();

        Consultation saved = consultationRepository.save(consultation);

        // Update appointment status to COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Update Queue status to COMPLETED if active in queue
        Optional<QueueEntry> queueOpt = queueEntryRepository.findByAppointmentId(appointment.getId());
        queueOpt.ifPresent(q -> {
            q.setStatus(QueueStatus.COMPLETED);
            q.setCompletedTime(java.time.LocalDateTime.now());
            queueEntryRepository.save(q);
        });

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Consultation Completed",
                String.format("Your consultation with Dr. %s is finalized. Diagnosis: %s",
                        appointment.getDoctor().getUser().getFullName(), request.getDiagnosis()),
                "CONSULTATION"
        );

        return mapToDto(saved);
    }

    public List<ConsultationDto> getConsultations(Long patientId, Long doctorId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUser.getId()).orElse(null);
            if (doctor != null) {
                return consultationRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId())
                        .stream().map(this::mapToDto).toList();
            }
            return java.util.Collections.emptyList();
        }
        if (patientId != null) {
            return getConsultationsForPatient(patientId);
        }
        if (doctorId != null) {
            return consultationRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                    .stream().map(this::mapToDto).toList();
        }
        return consultationRepository.findAll().stream().map(this::mapToDto).toList();
    }

    public List<ConsultationDto> getConsultationsForPatient(Long patientId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
            if (!patient.getId().equals(patientId)) {
                throw new BadRequestException("Unauthorized access to patient consultation history");
            }
        }
        return consultationRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::mapToDto).toList();
    }

    public ConsultationDto getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + id));
        return mapToDto(consultation);
    }

    public ConsultationDto mapToDto(Consultation c) {
        PrescriptionDto prescriptionDto = prescriptionRepository.findByConsultationId(c.getId())
                .map(prescriptionService::mapToDto).orElse(null);

        return ConsultationDto.builder()
                .id(c.getId())
                .appointmentId(c.getAppointment().getId())
                .patientId(c.getPatient().getId())
                .patientName(c.getPatient().getUser().getFullName())
                .doctorId(c.getDoctor().getId())
                .doctorName("Dr. " + c.getDoctor().getUser().getFullName())
                .symptoms(c.getSymptoms())
                .observations(c.getObservations())
                .diagnosis(c.getDiagnosis())
                .treatmentPlan(c.getTreatmentPlan())
                .followUpDate(c.getFollowUpDate())
                .aiSummary(c.getAiSummary())
                .prescription(prescriptionDto)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
