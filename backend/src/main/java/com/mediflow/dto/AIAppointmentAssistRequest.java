package com.mediflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIAppointmentAssistRequest {
    @NotBlank(message = "Natural language query is required")
    private String query; // e.g. "I need to see a cardiologist next Monday afternoon"
}
