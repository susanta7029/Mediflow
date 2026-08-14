package com.mediflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAppointmentAssistResponse {
    private String extractedDepartment;
    private Long departmentId;
    private LocalDate extractedDate;
    private String extractedTimeRange;
    private List<AvailableSlotDto> availableSlots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailableSlotDto {
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private LocalDate date;
        private String timeSlot;
    }
}
