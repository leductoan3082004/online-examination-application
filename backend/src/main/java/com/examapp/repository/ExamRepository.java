package com.examapp.repository;

import com.examapp.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    boolean existsByPasscode(String passcode);
    Optional<Exam> findByPasscode(String passcode);

    @Query("SELECT e FROM Exam e WHERE e.teacher.id = :teacherId ORDER BY e.createdAt DESC")
    List<Exam> findByTeacherIdOrderByCreatedAtDesc(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.exam.id = :examId")
    int countQuestionsByExamId(@Param("examId") Long examId);
}
