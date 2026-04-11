package com.examapp.dto.result;

import java.util.List;

public record QuestionAnalysisResponse(
        Long questionId,
        String questionText,
        Integer points,
        Double correctRate,
        long totalAnswers,
        List<OptionDistribution> optionDistribution
) {
    public record OptionDistribution(
            Long optionId,
            String optionText,
            Boolean isCorrect,
            long count,
            Double percentage
    ) {}
}
