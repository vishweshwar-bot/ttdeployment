package com.audiensense.dto;

import java.time.LocalDateTime;

public record UserReviewResponse(
        Long id,
        Long movieId,
        String movieTitle,
        String moviePosterUrl,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}
