package com.mediflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long todayAppointments;
    private long completedConsultations;
    private BigDecimal totalRevenue;

    private List<AppointmentDto> recentAppointments;
    private List<QueueEntryDto> activeQueue;
    private List<DepartmentStatDto> departmentStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStatDto {
        private String name;
        private long doctorCount;
        private long appointmentCount;
    }
}
