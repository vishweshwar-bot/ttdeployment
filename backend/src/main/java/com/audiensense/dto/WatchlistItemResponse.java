package com.audiensense.dto;

import java.time.LocalDateTime;

public record WatchlistItemResponse(
        Long id,
        Long movieId,
        String title,
        String genre,
        String posterUrl,
        LocalDateTime addedAt
) {
}
