package com.mediflow.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequest {
    private Long patientId; // Required if booked by Admin/Receptionist, inferred from Auth if Patient

    @NotNull(message = "Doctor is required")
    private Long doctorId;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    private String reason;
}
