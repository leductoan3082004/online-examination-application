package com.examapp.dto.result;

import java.util.List;

public record ClassStatisticsResponse(
        long totalAttempts,
        Double averageScore,
        Integer highestScore,
        Integer lowestScore,
        Double averagePercentage,
        Double passRate,
        int passThreshold,
        List<DistributionBucket> distribution
) {
    public record DistributionBucket(String range, long count) {}
}
