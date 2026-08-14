package com.mediflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDto {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String symptoms;
    private String observations;
    private String diagnosis;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String aiSummary;
    private PrescriptionDto prescription;
    private LocalDateTime createdAt;
}
