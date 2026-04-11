package com.examapp.dto.student;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SubmitTestRequest(
        @Valid @NotNull List<AnswerDto> answers
) {
    public record AnswerDto(
            @NotNull Long questionId,
            @NotNull Long selectedOptionId
    ) {}
}
