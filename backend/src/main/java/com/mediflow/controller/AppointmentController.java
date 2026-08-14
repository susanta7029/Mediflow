package com.mediflow.controller;

import com.mediflow.dto.*;
import com.mediflow.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Endpoints for booking, slot availability, and appointment status management.")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/available-slots")
    @Operation(summary = "Get available time slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAvailableSlots(doctorId, date)));
    }

    @PostMapping
    @Operation(summary = "Book a new appointment (guaranteed double-booking prevention)")
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentDto appointment = appointmentService.bookAppointment(request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @GetMapping
    @Operation(summary = "Get appointments for current authenticated user (Patient, Doctor, or Admin)")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsForCurrentUser()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentDto>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update appointment status (CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        AppointmentDto appointment = appointmentService.updateAppointmentStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated", appointment));
    }
}
