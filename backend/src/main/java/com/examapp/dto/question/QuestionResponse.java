package com.examapp.dto.question;

import java.util.List;

public record QuestionResponse(
        Long id,
        String questionText,
        Integer points,
        Integer displayOrder,
        List<OptionResponse> options
) {
    public record OptionResponse(
            Long id,
            String optionText,
            Boolean isCorrect,
            Integer displayOrder
    ) {}
}
