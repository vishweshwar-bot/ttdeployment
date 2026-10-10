package com.audiensense.dto;

import java.time.LocalDate;

public record TvShowResponse(
        Long id,
        String title,
        String genre,
        LocalDate releaseDate,
        String posterUrl,
        String network,
        Integer seasons
) {
}
