package com.mediflow.repository;

import com.mediflow.entity.Appointment;
import com.mediflow.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(Long doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    List<Appointment> findByAppointmentDateAndStatus(LocalDate appointmentDate, AppointmentStatus status);
    
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
            Long doctorId, LocalDate appointmentDate, String timeSlot, AppointmentStatus status);

    long countByAppointmentDate(LocalDate appointmentDate);
    long countByAppointmentDateAndStatus(LocalDate appointmentDate, AppointmentStatus status);
    long countByDoctorId(Long doctorId);
    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);
    long countByDoctorIdAndAppointmentDateAndStatus(Long doctorId, LocalDate appointmentDate, AppointmentStatus status);
}
