package com.examapp.dto.student;

import jakarta.validation.constraints.NotBlank;

public record StudentAccessRequest(
        @NotBlank(message = "Passcode is required") String passcode,
        @NotBlank(message = "Student name is required") String studentName
) {}
