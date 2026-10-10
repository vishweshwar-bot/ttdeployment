package com.audiensense.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long movieId,
        String username,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}
