package com.audiensense.dto;

import java.time.LocalDate;

public record MovieResponse(
        Long id,
        String title,
        String genre,
        LocalDate releaseDate,
        String boxOfficeMetrics,
        String posterUrl,
        Double averageRating,
        Integer reviewCount,
        Double imdbRating,
        String description,
        String leadActors,
        String director,
        String verdict,
        String seasonsEpisodes,
        String ottPlatform
) {
}
