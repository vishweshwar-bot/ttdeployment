package com.audiensense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MovieRequest(
        @NotBlank String title,
        @NotBlank String genre,
        @NotNull LocalDate releaseDate,
        @NotBlank String boxOfficeMetrics,
        @NotBlank String posterUrl,
        String leadActors,
        String director,
        String verdict,
        String seasonsEpisodes,
        String ottPlatform
) {
}
