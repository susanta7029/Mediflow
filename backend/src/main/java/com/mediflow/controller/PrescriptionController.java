package com.mediflow.controller;

import com.mediflow.dto.ApiResponse;
import com.mediflow.dto.PrescriptionDto;
import com.mediflow.dto.PrescriptionRequest;
import com.mediflow.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Endpoints for generating and viewing medical prescriptions.")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Generate a new prescription with medications, dosages, and instructions")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(@Valid @RequestBody PrescriptionRequest request) {
        PrescriptionDto prescription = prescriptionService.createPrescription(request);
        return ResponseEntity.ok(ApiResponse.success("Prescription generated successfully", prescription));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get prescription by ID")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get all prescriptions")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getAllPrescriptions() {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getAllPrescriptions()));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get prescriptions for a patient")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getPrescriptionsForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionsForPatient(patientId)));
    }
}
