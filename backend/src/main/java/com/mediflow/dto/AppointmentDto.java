package com.mediflow.dto;

import com.mediflow.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private Long departmentId;
    private String departmentName;
    private LocalDate appointmentDate;
    private String timeSlot;
    private AppointmentStatus status;
    private String reason;
    private String cancellationReason;
    private Long queueEntryId;
    private Integer queueNumber;
    private LocalDateTime createdAt;
}
