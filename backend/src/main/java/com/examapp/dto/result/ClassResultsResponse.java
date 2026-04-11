package com.examapp.dto.result;

import java.time.Instant;
import java.util.List;

public record ClassResultsResponse(
        long totalStudents,
        int page,
        int size,
        List<StudentResultDto> results
) {
    public record StudentResultDto(
            Long attemptId,
            String studentName,
            Integer score,
            Integer maxScore,
            Double percentage,
            Instant submittedAt
    ) {}
}
