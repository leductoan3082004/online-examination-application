package com.examapp.dto.test;

import jakarta.validation.constraints.NotBlank;

public record CreateTestRequest(
        @NotBlank(message = "Title is required") String title,
        String description,
        @NotBlank(message = "Passcode is required") String passcode
) {}
