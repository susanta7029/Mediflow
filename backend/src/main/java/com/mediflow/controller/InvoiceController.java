package com.mediflow.controller;

import com.mediflow.dto.ApiResponse;
import com.mediflow.dto.InvoiceDto;
import com.mediflow.dto.InvoiceRequest;
import com.mediflow.dto.PaymentRequest;
import com.mediflow.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Billing & Invoices", description = "Endpoints for invoice generation, payment processing, and patient billing history.")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Generate a new invoice for consultation/services")
    public ResponseEntity<ApiResponse<InvoiceDto>> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        InvoiceDto invoice = invoiceService.createInvoice(request);
        return ResponseEntity.ok(ApiResponse.success("Invoice created successfully", invoice));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Process invoice payment (Mock payment gateway integration point)")
    public ResponseEntity<ApiResponse<InvoiceDto>> processPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        InvoiceDto invoice = invoiceService.processPayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", invoice));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Get list of all invoices in the platform")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice details by ID")
    public ResponseEntity<ApiResponse<InvoiceDto>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get invoice history for a specific patient")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getInvoicesForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoicesForPatient(patientId)));
    }
}
