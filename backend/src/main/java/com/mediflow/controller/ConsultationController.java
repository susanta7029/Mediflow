package com.mediflow.controller;

import com.mediflow.dto.ApiResponse;
import com.mediflow.dto.ConsultationDto;
import com.mediflow.dto.ConsultationRequest;
import com.mediflow.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Endpoints for creating clinical consultation records and clinical histories.")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Create a consultation record (Doctor only)")
    public ResponseEntity<ApiResponse<ConsultationDto>> createConsultation(@Valid @RequestBody ConsultationRequest request) {
        ConsultationDto consultation = consultationService.createConsultation(request);
        return ResponseEntity.ok(ApiResponse.success("Consultation saved successfully", consultation));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get consultation details by ID")
    public ResponseEntity<ApiResponse<ConsultationDto>> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultationById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get all consultations or filter by patientId/doctorId")
    public ResponseEntity<ApiResponse<List<ConsultationDto>>> getConsultations(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultations(patientId, doctorId)));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get consultation history for a patient")
    public ResponseEntity<ApiResponse<List<ConsultationDto>>> getConsultationsForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultationsForPatient(patientId)));
    }
}
