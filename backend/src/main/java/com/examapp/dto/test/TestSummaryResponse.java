package com.examapp.dto.test;

import java.time.Instant;

public record TestSummaryResponse(
        Long id,
        String title,
        String passcode,
        int questionCount,
        Instant createdAt
) {}
