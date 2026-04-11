package com.examapp.dto.student;

public record StudentAccessResponse(
        String token,
        Long testId,
        String testTitle,
        Long studentId
) {}
