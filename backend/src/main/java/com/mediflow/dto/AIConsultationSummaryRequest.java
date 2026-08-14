package com.mediflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIConsultationSummaryRequest {
    private String symptoms;
    private String observations;
    @NotBlank(message = "Diagnosis or notes are required for AI summary generation")
    private String diagnosis;
    private String treatmentNotes;
}
