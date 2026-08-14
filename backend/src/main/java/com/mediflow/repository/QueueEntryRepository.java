package com.mediflow.repository;

import com.mediflow.entity.QueueEntry;
import com.mediflow.entity.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    Optional<QueueEntry> findByAppointmentId(Long appointmentId);
    List<QueueEntry> findByDoctorIdAndStatus(Long doctorId, QueueStatus status);
    List<QueueEntry> findByStatusOrderByCheckInTimeAsc(QueueStatus status);
    List<QueueEntry> findByDoctorIdAndCheckInTimeBetweenOrderByQueueNumberAsc(
            Long doctorId, LocalDateTime start, LocalDateTime end);
    List<QueueEntry> findByCheckInTimeBetweenOrderByQueueNumberAsc(
            LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT MAX(q.queueNumber) FROM QueueEntry q WHERE q.doctor.id = :doctorId AND q.checkInTime >= :startOfDay")
    Integer findMaxQueueNumberForDoctorToday(@Param("doctorId") Long doctorId, @Param("startOfDay") LocalDateTime startOfDay);

    long countByDoctorIdAndStatus(Long doctorId, QueueStatus status);
}
