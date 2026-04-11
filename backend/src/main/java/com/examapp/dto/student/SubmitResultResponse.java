package com.examapp.dto.student;

import java.time.Instant;

public record SubmitResultResponse(
        Long attemptId,
        Integer score,
        Integer maxScore,
        Double percentage,
        Instant submittedAt
) {}
