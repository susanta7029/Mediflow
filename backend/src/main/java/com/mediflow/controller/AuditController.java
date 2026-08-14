package com.mediflow.controller;

import com.mediflow.dto.ApiResponse;
import com.mediflow.dto.AuditLogDto;
import com.mediflow.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Endpoints for viewing security and operational audit trails.")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get recent audit logs (Admin only)")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getRecentAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getRecentAuditLogs()));
    }
}
