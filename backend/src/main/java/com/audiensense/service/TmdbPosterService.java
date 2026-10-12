package com.audiensense.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TmdbPosterService {

    @Value("${tmdb.api.key:}")
    private String tmdbApiKey;

    private final RestTemplate restTemplate;
    private final ImdbSyncService imdbSyncService;

    public TmdbPosterService(RestTemplate restTemplate, ImdbSyncService imdbSyncService) {
        this.restTemplate = restTemplate;
        this.imdbSyncService = imdbSyncService;
    }

    public String fetchPosterUrl(String movieTitle) {
        if (movieTitle == null || movieTitle.isBlank()) {
            return "https://placehold.co/500x750/0f172a/38bdf8?text=Movie";
        }

        try {
            var meta = imdbSyncService.fetchMovieMetadata(movieTitle);
            if (meta.found() && meta.posterUrl() != null && !meta.posterUrl().isBlank()) {
                return meta.posterUrl();
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch IMDb poster via ImdbSyncService for " + movieTitle + ": " + e.getMessage());
        }

        // Fallback on error or if poster not found
        return "https://placehold.co/500x750/0f172a/38bdf8?text=" + URLEncoder.encode(movieTitle, StandardCharsets.UTF_8);
    }
}
