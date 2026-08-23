package com.mediflow.service;

import com.mediflow.dto.AppointmentDto;
import com.mediflow.dto.DashboardStatsDto;
import com.mediflow.entity.*;
import com.mediflow.repository.*;
import com.mediflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentService appointmentService;

    public DashboardStatsDto getAdminDashboardStats() {
        User currentUser = SecurityUtils.getCurrentUser();
        Role role = currentUser.getRole();

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long todayAppointments;
        long completedConsultations;
        List<AppointmentDto> recentAppointments;

        if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUser.getId()).orElse(null);
            if (doctor != null) {
                todayAppointments = appointmentRepository.countByDoctorIdAndAppointmentDate(doctor.getId(), LocalDate.now());
                completedConsultations = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.COMPLETED);
                totalPatients = appointmentRepository.countByDoctorId(doctor.getId());
                recentAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(doctor.getId()).stream()
                        .map(appointmentService::mapToDto)
                        .toList();
            } else {
                todayAppointments = 0;
                completedConsultations = 0;
                recentAppointments = Collections.emptyList();
            }
        } else if (role == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId()).orElse(null);
            todayAppointments = appointmentRepository.countByAppointmentDate(LocalDate.now());
            completedConsultations = appointmentRepository.countByAppointmentDateAndStatus(LocalDate.now(), AppointmentStatus.COMPLETED);
            if (patient != null) {
                recentAppointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(patient.getId()).stream()
                        .limit(5)
                        .map(appointmentService::mapToDto)
                        .toList();
            } else {
                recentAppointments = Collections.emptyList();
            }
        } else {
            // ADMIN / RECEPTIONIST: Global Hospital Metrics
            todayAppointments = appointmentRepository.countByAppointmentDate(LocalDate.now());
            completedConsultations = appointmentRepository.countByAppointmentDateAndStatus(LocalDate.now(), AppointmentStatus.COMPLETED);
            recentAppointments = appointmentRepository.findAll().stream()
                    .sorted((a, b) -> b.getId().compareTo(a.getId()))
                    .limit(5)
                    .map(appointmentService::mapToDto)
                    .toList();
        }

        BigDecimal revenue = invoiceRepository.calculateTotalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        List<DashboardStatsDto.DepartmentStatDto> departmentStats = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            long docCount = doctorRepository.findByDepartmentId(dept.getId()).size();
            long apptCount = appointmentRepository.findAll().stream()
                    .filter(a -> a.getDepartment().getId().equals(dept.getId())).count();
            departmentStats.add(new DashboardStatsDto.DepartmentStatDto(dept.getName(), docCount, apptCount));
        }

        return DashboardStatsDto.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .todayAppointments(todayAppointments)
                .completedConsultations(completedConsultations)
                .totalRevenue(revenue)
                .recentAppointments(recentAppointments)
                .activeQueue(Collections.emptyList())
                .departmentStats(departmentStats)
                .build();
    }
}
