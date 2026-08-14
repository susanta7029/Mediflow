package com.mediflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // e.g. CREDIT_CARD, UPI, CASH, STRIPE_MOCK

    private String transactionId;
}
