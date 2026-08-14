package com.mediflow.service;

import com.mediflow.dto.QueueEntryDto;
import com.mediflow.entity.*;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.AppointmentRepository;
import com.mediflow.repository.QueueEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueEntryRepository queueEntryRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Transactional
    public QueueEntryDto checkInAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        // Demo flexibility: allow check-in for scheduled appointments
        // if (!appointment.getAppointmentDate().equals(LocalDate.now())) { ... }

        if (queueEntryRepository.findByAppointmentId(appointmentId).isPresent()) {
            throw new BadRequestException("Patient is already checked into the queue");
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        Integer maxQueueNum = queueEntryRepository.findMaxQueueNumberForDoctorToday(appointment.getDoctor().getId(), startOfDay);
        int nextQueueNum = (maxQueueNum != null && maxQueueNum >= 100) ? maxQueueNum + 1 : 101;

        QueueEntry entry = QueueEntry.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .queueNumber(nextQueueNum)
                .status(QueueStatus.WAITING)
                .checkInTime(LocalDateTime.now())
                .build();

        QueueEntry saved = queueEntryRepository.save(entry);

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointmentRepository.save(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Checked In",
                String.format("You are checked in! Your Queue Token is Q-%d. Please proceed to Dr. %s's waiting room.",
                        nextQueueNum, appointment.getDoctor().getUser().getFullName()),
                "QUEUE"
        );

        return mapToDto(saved);
    }

    @Transactional
    public QueueEntryDto callNextPatient(Long doctorId) {
        List<QueueEntry> waitingQueue;
        if (doctorId != null && doctorId > 0) {
            waitingQueue = queueEntryRepository.findByDoctorIdAndStatus(doctorId, QueueStatus.WAITING);
        } else {
            waitingQueue = queueEntryRepository.findByStatusOrderByCheckInTimeAsc(QueueStatus.WAITING);
        }

        if (waitingQueue.isEmpty()) {
            throw new BadRequestException(
                    doctorId != null && doctorId > 0
                            ? "No patients currently waiting in queue for this doctor"
                            : "No patients currently waiting in queue across all doctors"
            );
        }

        // Pick first waiting patient
        QueueEntry nextEntry = waitingQueue.get(0);

        // Auto-complete previous patient in this doctor's consultation room
        List<QueueEntry> previousInRoom = queueEntryRepository.findByDoctorIdAndStatus(nextEntry.getDoctor().getId(), QueueStatus.IN_ROOM);
        for (QueueEntry prev : previousInRoom) {
            prev.setStatus(QueueStatus.COMPLETED);
            prev.setCompletedTime(LocalDateTime.now());
            queueEntryRepository.save(prev);

            Appointment prevAppt = prev.getAppointment();
            prevAppt.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(prevAppt);
        }

        nextEntry.setStatus(QueueStatus.IN_ROOM);
        nextEntry.setCalledTime(LocalDateTime.now());
        QueueEntry saved = queueEntryRepository.save(nextEntry);

        Appointment appt = nextEntry.getAppointment();
        appt.setStatus(AppointmentStatus.IN_PROGRESS);
        appointmentRepository.save(appt);

        notificationService.createNotification(
                nextEntry.getPatient().getUser(),
                "Doctor Calling",
                String.format("Dr. %s is calling Queue Token Q-%d. Please enter Consultation Room.",
                        nextEntry.getDoctor().getUser().getFullName(), nextEntry.getQueueNumber()),
                "QUEUE"
        );

        return mapToDto(saved);
    }

    @Transactional
    public QueueEntryDto updateQueueStatus(Long queueId, QueueStatus status) {
        QueueEntry entry = queueEntryRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found with ID: " + queueId));

        entry.setStatus(status);
        if (status == QueueStatus.COMPLETED) {
            entry.setCompletedTime(LocalDateTime.now());
            Appointment appt = entry.getAppointment();
            appt.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appt);
        }

        QueueEntry updated = queueEntryRepository.save(entry);
        return mapToDto(updated);
    }

    public List<QueueEntryDto> getTodayQueueForDoctor(Long doctorId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        if (doctorId != null && doctorId > 0) {
            return queueEntryRepository.findByDoctorIdAndCheckInTimeBetweenOrderByQueueNumberAsc(doctorId, start, end)
                    .stream().map(this::mapToDto).toList();
        } else {
            return queueEntryRepository.findByCheckInTimeBetweenOrderByQueueNumberAsc(start, end)
                    .stream().map(this::mapToDto).toList();
        }
    }

    public QueueEntryDto mapToDto(QueueEntry entry) {
        return QueueEntryDto.builder()
                .id(entry.getId())
                .appointmentId(entry.getAppointment().getId())
                .patientId(entry.getPatient().getId())
                .patientName(entry.getPatient().getUser().getFullName())
                .doctorId(entry.getDoctor().getId())
                .doctorName("Dr. " + entry.getDoctor().getUser().getFullName())
                .queueNumber(entry.getQueueNumber())
                .status(entry.getStatus())
                .checkInTime(entry.getCheckInTime())
                .calledTime(entry.getCalledTime())
                .completedTime(entry.getCompletedTime())
                .build();
    }
}
