package com.mediflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {
    private Long id;
    private Long userId;
    private String doctorName;
    private String email;
    private String phoneNumber;
    private Long departmentId;
    private String departmentName;
    private String specialization;
    private String qualification;
    private String licenseNumber;
    private BigDecimal consultationFee;
    private String bio;
    private String availableDays;
}
