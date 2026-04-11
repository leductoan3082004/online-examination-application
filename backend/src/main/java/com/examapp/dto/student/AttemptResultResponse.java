package com.examapp.dto.student;

import java.time.Instant;
import java.util.List;

public record AttemptResultResponse(
        Long attemptId,
        String testTitle,
        Integer score,
        Integer maxScore,
        Double percentage,
        Instant submittedAt,
        List<QuestionResultDto> questions
) {
    public record QuestionResultDto(
            Long questionId,
            String questionText,
            Integer points,
            Long selectedOptionId,
            String selectedOptionText,
            Long correctOptionId,
            String correctOptionText,
            Boolean isCorrect
    ) {}
}
