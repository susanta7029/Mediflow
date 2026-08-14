package com.mediflow.service;

import com.mediflow.dto.InvoiceDto;
import com.mediflow.dto.InvoiceItemDto;
import com.mediflow.dto.InvoiceRequest;
import com.mediflow.dto.PaymentRequest;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.*;
import com.mediflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Transactional
    public InvoiceDto createInvoice(InvoiceRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        String invoiceNum = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        BigDecimal subtotal = BigDecimal.ZERO;
        Invoice invoice = Invoice.builder()
                .patient(patient)
                .appointment(appointment)
                .invoiceNumber(invoiceNum)
                .amount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .status(InvoiceStatus.ISSUED)
                .dueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(7))
                .build();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (InvoiceItemDto itemDto : request.getItems()) {
                BigDecimal itemTotal = itemDto.getUnitPrice().multiply(new BigDecimal(itemDto.getQuantity()));
                subtotal = subtotal.add(itemTotal);

                InvoiceItem item = InvoiceItem.builder()
                        .description(itemDto.getDescription())
                        .unitPrice(itemDto.getUnitPrice())
                        .quantity(itemDto.getQuantity())
                        .totalPrice(itemTotal)
                        .build();
                invoice.addItem(item);
            }
        } else if (appointment != null) {
            BigDecimal fee = appointment.getDoctor().getConsultationFee();
            subtotal = fee;
            InvoiceItem item = InvoiceItem.builder()
                    .description("Consultation Fee - Dr. " + appointment.getDoctor().getUser().getFullName())
                    .unitPrice(fee)
                    .quantity(1)
                    .totalPrice(fee)
                    .build();
            invoice.addItem(item);
        }

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.10")); // 10% tax
        BigDecimal total = subtotal.add(tax);

        invoice.setAmount(subtotal);
        invoice.setTaxAmount(tax);
        invoice.setTotalAmount(total);

        Invoice saved = invoiceRepository.save(invoice);

        notificationService.createNotification(
                patient.getUser(),
                "New Invoice Issued",
                String.format("Invoice %s for $%s has been issued. Due date: %s", invoiceNum, total, invoice.getDueDate()),
                "BILLING"
        );

        return mapToDto(saved);
    }

    @Transactional
    public InvoiceDto processPayment(Long invoiceId, PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Invoice is already paid");
        }

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaymentMethod(request.getPaymentMethod());
        invoice.setPaymentTransactionId(request.getTransactionId() != null ? request.getTransactionId() : "MOCK-TXN-" + UUID.randomUUID().toString().substring(0, 8));
        invoice.setPaidAt(LocalDateTime.now());

        Invoice updated = invoiceRepository.save(invoice);

        notificationService.createNotification(
                invoice.getPatient().getUser(),
                "Payment Received",
                String.format("Payment of $%s for Invoice %s completed successfully via %s.",
                        invoice.getTotalAmount(), invoice.getInvoiceNumber(), request.getPaymentMethod()),
                "BILLING"
        );

        return mapToDto(updated);
    }

    public List<InvoiceDto> getInvoicesForPatient(Long patientId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
            if (!patient.getId().equals(patientId)) {
                throw new BadRequestException("Unauthorized access to patient invoices");
            }
        }
        return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::mapToDto).toList();
    }

    public List<InvoiceDto> getAllInvoices() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId()).orElse(null);
            if (patient != null) {
                return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                        .stream().map(this::mapToDto).toList();
            }
            return java.util.Collections.emptyList();
        }
        return invoiceRepository.findAll().stream().map(this::mapToDto).toList();
    }

    public InvoiceDto getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));
        return mapToDto(invoice);
    }

    public InvoiceDto mapToDto(Invoice inv) {
        List<InvoiceItemDto> items = inv.getItems().stream()
                .map(item -> InvoiceItemDto.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .toList();

        return InvoiceDto.builder()
                .id(inv.getId())
                .patientId(inv.getPatient().getId())
                .patientName(inv.getPatient().getUser().getFullName())
                .appointmentId(inv.getAppointment() != null ? inv.getAppointment().getId() : null)
                .invoiceNumber(inv.getInvoiceNumber())
                .amount(inv.getAmount())
                .taxAmount(inv.getTaxAmount())
                .totalAmount(inv.getTotalAmount())
                .status(inv.getStatus())
                .paymentMethod(inv.getPaymentMethod())
                .paymentTransactionId(inv.getPaymentTransactionId())
                .dueDate(inv.getDueDate())
                .paidAt(inv.getPaidAt())
                .items(items)
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
