package com.mediflow.controller;

import com.mediflow.dto.ApiResponse;
import com.mediflow.dto.QueueEntryDto;
import com.mediflow.entity.QueueStatus;
import com.mediflow.service.QueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
@Tag(name = "Queue Management", description = "Endpoints for real-time patient queue check-in, doctor call, and status tracking.")
public class QueueController {

    private final QueueService queueService;

    @PostMapping("/check-in/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Check in patient for today's appointment and generate queue token (Q-101)")
    public ResponseEntity<ApiResponse<QueueEntryDto>> checkIn(@PathVariable Long appointmentId) {
        QueueEntryDto queueEntry = queueService.checkInAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Patient checked into queue successfully", queueEntry));
    }

    @PostMapping("/call-next/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Doctor or staff calls next waiting patient into consultation room")
    public ResponseEntity<ApiResponse<QueueEntryDto>> callNextPatient(@PathVariable Long doctorId) {
        QueueEntryDto queueEntry = queueService.callNextPatient(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Next patient called", queueEntry));
    }

    @PutMapping("/{queueId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Update queue entry status (WAITING, IN_ROOM, COMPLETED, SKIPPED)")
    public ResponseEntity<ApiResponse<QueueEntryDto>> updateQueueStatus(
            @PathVariable Long queueId, @RequestParam QueueStatus status) {
        QueueEntryDto queueEntry = queueService.updateQueueStatus(queueId, status);
        return ResponseEntity.ok(ApiResponse.success("Queue status updated", queueEntry));
    }

    @GetMapping("/today/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get today's active queue entries for a doctor or all doctors")
    public ResponseEntity<ApiResponse<List<QueueEntryDto>>> getTodayQueue(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(queueService.getTodayQueueForDoctor(doctorId)));
    }
}
