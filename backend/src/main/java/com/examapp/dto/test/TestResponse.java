package com.examapp.dto.test;

import java.time.Instant;

public record TestResponse(
        Long id,
        String title,
        String description,
        String passcode,
        Long teacherId,
        Instant createdAt,
        Instant updatedAt
) {}
