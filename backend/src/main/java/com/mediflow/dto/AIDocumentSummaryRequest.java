package com.mediflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIDocumentSummaryRequest {
    @NotBlank(message = "Document content is required")
    private String documentContent;

    private String documentType; // e.g., LAB_REPORT, DISCHARGE_SUMMARY, RADIOLOGY
}
