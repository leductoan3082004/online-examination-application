package com.examapp.dto.question;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReorderRequest(
        @NotNull(message = "Question IDs are required") List<Long> questionIds
) {}
