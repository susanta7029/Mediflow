package com.mediflow.dto;

import com.mediflow.entity.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long appointmentId;
    private String invoiceNumber;
    private BigDecimal amount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private String paymentMethod;
    private String paymentTransactionId;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    private List<InvoiceItemDto> items;
    private LocalDateTime createdAt;
}
