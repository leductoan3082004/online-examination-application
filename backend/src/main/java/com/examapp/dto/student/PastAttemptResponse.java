package com.examapp.dto.student;

import java.time.Instant;

public record PastAttemptResponse(
        Long attemptId,
        String testTitle,
        Integer score,
        Integer maxScore,
        Double percentage,
        Instant submittedAt
) {}
