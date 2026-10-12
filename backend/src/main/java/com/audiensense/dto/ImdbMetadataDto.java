package com.audiensense.dto;

import java.time.LocalDate;

public record ImdbMetadataDto(
        boolean found,
        String title,
        String posterUrl,
        Double imdbRating,
        String description,
        String leadActors,
        String director,
        String genre,
        LocalDate releaseDate,
        String boxOffice,
        String imdbId,
        String message
) {
    public static ImdbMetadataDto notFound(String message) {
        return new ImdbMetadataDto(false, null, null, null, null, null, null, null, null, null, null, message);
    }
}
