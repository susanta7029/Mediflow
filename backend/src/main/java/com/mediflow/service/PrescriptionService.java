package com.mediflow.service;

import com.mediflow.dto.PrescriptionDto;
import com.mediflow.dto.PrescriptionItemDto;
import com.mediflow.dto.PrescriptionRequest;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;

    @Transactional
    public PrescriptionDto createPrescription(PrescriptionRequest request) {
        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + request.getConsultationId()));

        if (prescriptionRepository.findByConsultationId(request.getConsultationId()).isPresent()) {
            throw new BadRequestException("Prescription already generated for this consultation");
        }

        Prescription prescription = Prescription.builder()
                .consultation(consultation)
                .patient(consultation.getPatient())
                .doctor(consultation.getDoctor())
                .notes(request.getNotes())
                .build();

        for (PrescriptionItemDto itemDto : request.getItems()) {
            PrescriptionItem item = PrescriptionItem.builder()
                    .medicineName(itemDto.getMedicineName())
                    .dosage(itemDto.getDosage())
                    .frequency(itemDto.getFrequency())
                    .duration(itemDto.getDuration())
                    .instructions(itemDto.getInstructions())
                    .build();
            prescription.addItem(item);
        }

        Prescription saved = prescriptionRepository.save(prescription);

        notificationService.createNotification(
                consultation.getPatient().getUser(),
                "New Prescription Issued",
                String.format("Dr. %s has created a new prescription for your consultation.", consultation.getDoctor().getUser().getFullName()),
                "PRESCRIPTION"
        );

        return mapToDto(saved);
    }

    public List<PrescriptionDto> getAllPrescriptions() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUser.getId()).orElse(null);
            if (doctor != null) {
                return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId())
                        .stream().map(this::mapToDto).toList();
            }
            return java.util.Collections.emptyList();
        } else if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId()).orElse(null);
            if (patient != null) {
                return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                        .stream().map(this::mapToDto).toList();
            }
            return java.util.Collections.emptyList();
        }
        return prescriptionRepository.findAll().stream().map(this::mapToDto).toList();
    }

    public List<PrescriptionDto> getPrescriptionsForPatient(Long patientId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
            if (!patient.getId().equals(patientId)) {
                throw new BadRequestException("Unauthorized access to patient prescriptions");
            }
        }
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::mapToDto).toList();
    }

    public PrescriptionDto getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        return mapToDto(prescription);
    }

    public PrescriptionDto mapToDto(Prescription p) {
        List<PrescriptionItemDto> items = p.getItems().stream()
                .map(item -> PrescriptionItemDto.builder()
                        .id(item.getId())
                        .medicineName(item.getMedicineName())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .instructions(item.getInstructions())
                        .build())
                .toList();

        return PrescriptionDto.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getUser().getFullName())
                .doctorId(p.getDoctor().getId())
                .doctorName("Dr. " + p.getDoctor().getUser().getFullName())
                .doctorSpecialization(p.getDoctor().getSpecialization())
                .notes(p.getNotes())
                .items(items)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
