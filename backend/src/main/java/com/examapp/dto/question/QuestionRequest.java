package com.examapp.dto.question;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record QuestionRequest(
        @NotBlank(message = "Question text is required") String questionText,
        @NotNull(message = "Points is required") @Min(value = 1, message = "Points must be at least 1") Integer points,
        @NotNull(message = "Display order is required") Integer displayOrder,
        @Valid @NotNull @Size(min = 2, message = "At least 2 options required") List<OptionRequest> options
) {
    public record OptionRequest(
            @NotBlank(message = "Option text is required") String optionText,
            @NotNull(message = "isCorrect is required") Boolean isCorrect,
            @NotNull(message = "Display order is required") Integer displayOrder
    ) {}
}
