package com.examapp.repository;

import com.examapp.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByAttemptId(Long attemptId);

    @Query("SELECT sa FROM StudentAnswer sa " +
           "JOIN sa.attempt ta " +
           "WHERE ta.exam.id = :examId AND sa.question.id = :questionId")
    List<StudentAnswer> findByExamIdAndQuestionId(@Param("examId") Long examId,
                                                   @Param("questionId") Long questionId);
}
