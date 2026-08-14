package com.mediflow;

import com.mediflow.dto.AppointmentRequest;
import com.mediflow.entity.*;
import com.mediflow.exception.ConcurrencyException;
import com.mediflow.repository.*;
import com.mediflow.security.SecurityUtils;
import com.mediflow.service.AppointmentService;
import com.mediflow.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private QueueEntryRepository queueEntryRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Doctor doctor;
    private Patient patient;
    private Department department;
    private User patientUser;

    @BeforeEach
    void setUp() {
        patientUser = User.builder().id(6L).email("patient@mediflow.com").role(Role.PATIENT).firstName("John").lastName("Doe").build();
        User doctorUser = User.builder().id(2L).email("doctor@mediflow.com").role(Role.DOCTOR).firstName("Robert").lastName("Chen").build();

        department = Department.builder().id(1L).name("Cardiology").code("CARD").build();
        doctor = Doctor.builder().id(1L).user(doctorUser).department(department).consultationFee(new BigDecimal("150.00")).build();
        patient = Patient.builder().id(1L).user(patientUser).build();
    }

    @Test
    @DisplayName("Should throw ConcurrencyException when slot is already booked for same doctor and date")
    void bookAppointment_DoubleBookingPrevention() {
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(1L);
        request.setDepartmentId(1L);
        request.setAppointmentDate(LocalDate.now().plusDays(1));
        request.setTimeSlot("09:00 AM - 09:30 AM");

        try (MockedStatic<SecurityUtils> utilities = Mockito.mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::getCurrentUser).thenReturn(patientUser);

            when(patientRepository.findByUserId(6L)).thenReturn(Optional.of(patient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
            when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
            when(appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                    eq(1L), any(), eq("09:00 AM - 09:30 AM"), eq(AppointmentStatus.CANCELLED))).thenReturn(true);

            assertThrows(ConcurrencyException.class, () -> appointmentService.bookAppointment(request));
        }
    }
}
