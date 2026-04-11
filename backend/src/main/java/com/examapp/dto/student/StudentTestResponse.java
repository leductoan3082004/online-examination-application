package com.examapp.dto.student;

import java.util.List;

public record StudentTestResponse(
        String testTitle,
        String testDescription,
        int totalQuestions,
        List<StudentQuestionDto> questions
) {
    public record StudentQuestionDto(
            Long id,
            String questionText,
            Integer points,
            Integer displayOrder,
            List<StudentOptionDto> options
    ) {}

    public record StudentOptionDto(
            Long id,
            String optionText,
            Integer displayOrder
    ) {}
}
