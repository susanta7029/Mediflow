package com.mediflow.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequest {
    @NotNull(message = "Consultation ID is required")
    private Long consultationId;

    private String notes;

    @NotEmpty(message = "Prescription must contain at least one medicine item")
    private List<PrescriptionItemDto> items;
}
