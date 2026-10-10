package com.audiensense.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TmdbPosterService {

    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key:}")
    private String tmdbApiKey;

    public TmdbPosterService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String fetchPosterUrl(String movieTitle) {
        // We are using OMDB API to fetch IMDB poster URLs securely in Java
        String omdbApiKey = "thewdb";

        try {
            String query = URLEncoder.encode(movieTitle, StandardCharsets.UTF_8);
            String url = "http://www.omdbapi.com/?apikey=" + omdbApiKey + "&t=" + query;

            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            if (response != null && response.has("Poster")) {
                String posterPath = response.get("Poster").asText();
                if (posterPath != null && !posterPath.equals("N/A") && !posterPath.isBlank()) {
                    return posterPath;
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch IMDB poster for " + movieTitle + ": " + e.getMessage());
        }

        // Fallback on error or if poster not found
        return "https://placehold.co/500x750/0f172a/38bdf8?text=" + URLEncoder.encode(movieTitle, StandardCharsets.UTF_8);
    }
}
