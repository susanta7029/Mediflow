package com.mediflow.dto;

import com.mediflow.entity.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueEntryDto {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Integer queueNumber;
    private QueueStatus status;
    private LocalDateTime checkInTime;
    private LocalDateTime calledTime;
    private LocalDateTime completedTime;
}
