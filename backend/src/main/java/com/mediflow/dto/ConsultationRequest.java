package com.mediflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ConsultationRequest {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String symptoms;
    private String observations;
    private String diagnosis;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String aiSummary;
}
