package com.audiensense.dto;

public record AdminReviewResponse(
        Long id,
        String username,
        String movieTitle,
        Integer rating,
        String comment
) {
}
