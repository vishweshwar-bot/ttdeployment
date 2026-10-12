package com.audiensense.service;

import com.audiensense.dto.ImdbMetadataDto;
import com.audiensense.entity.Movie;
import com.audiensense.repository.MovieRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ImdbSyncService {

    private static final Logger log = LoggerFactory.getLogger(ImdbSyncService.class);

    private final RestTemplate restTemplate;
    private final MovieRepository movieRepository;

    @Value("${imdb.api.key:}")
    private String apiKey;

    @Value("${imdb.api.url:http://www.omdbapi.com/}")
    private String apiUrl;

    public ImdbSyncService(RestTemplate restTemplate, MovieRepository movieRepository) {
        this.restTemplate = restTemplate;
        this.movieRepository = movieRepository;
    }

    /**
     * Checks if an IMDb / OMDb API key is configured.
     */
    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Fetches metadata for a movie by title directly from IMDb/OMDb API.
     */
    public ImdbMetadataDto fetchMovieMetadata(String title) {
        if (!isApiKeyConfigured()) {
            return ImdbMetadataDto.notFound("IMDb API key is not configured. Add IMDB_API_KEY in your .env or Render dashboard.");
        }

        if (title == null || title.isBlank()) {
            return ImdbMetadataDto.notFound("Movie title cannot be empty");
        }

        try {
            String query = URLEncoder.encode(title.trim(), StandardCharsets.UTF_8);
            String url = apiUrl + "?apikey=" + apiKey.trim() + "&t=" + query + "&plot=full";

            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            if (response == null || !"True".equalsIgnoreCase(response.path("Response").asText())) {
                String errorMsg = response != null && response.has("Error") 
                        ? response.path("Error").asText() 
                        : "Movie not found on IMDb";
                return ImdbMetadataDto.notFound(errorMsg);
            }

            // Extract Poster URL
            String posterUrl = null;
            if (response.has("Poster")) {
                String p = response.path("Poster").asText();
                if (p != null && !p.isBlank() && !"N/A".equalsIgnoreCase(p) && p.startsWith("http")) {
                    posterUrl = p;
                }
            }

            // Extract IMDb Rating
            Double imdbRating = null;
            if (response.has("imdbRating")) {
                String r = response.path("imdbRating").asText();
                if (r != null && !r.isBlank() && !"N/A".equalsIgnoreCase(r)) {
                    try {
                        imdbRating = Double.parseDouble(r);
                    } catch (NumberFormatException ignored) {}
                }
            }

            // Extract Plot Description
            String description = null;
            if (response.has("Plot")) {
                String pl = response.path("Plot").asText();
                if (pl != null && !pl.isBlank() && !"N/A".equalsIgnoreCase(pl)) {
                    description = pl;
                }
            }

            // Extract Cast / Lead Actors
            String leadActors = null;
            if (response.has("Actors")) {
                String act = response.path("Actors").asText();
                if (act != null && !act.isBlank() && !"N/A".equalsIgnoreCase(act)) {
                    leadActors = act;
                }
            }

            // Extract Director
            String director = null;
            if (response.has("Director")) {
                String dir = response.path("Director").asText();
                if (dir != null && !dir.isBlank() && !"N/A".equalsIgnoreCase(dir)) {
                    director = dir;
                }
            }

            // Extract Genre
            String genre = null;
            if (response.has("Genre")) {
                String gen = response.path("Genre").asText();
                if (gen != null && !gen.isBlank() && !"N/A".equalsIgnoreCase(gen)) {
                    genre = gen;
                }
            }

            // Extract Release Date
            LocalDate releaseDate = null;
            if (response.has("Released")) {
                String rel = response.path("Released").asText();
                if (rel != null && !rel.isBlank() && !"N/A".equalsIgnoreCase(rel)) {
                    try {
                        releaseDate = LocalDate.parse(rel, DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH));
                    } catch (Exception e) {
                        if (response.has("Year")) {
                            try {
                                int year = Integer.parseInt(response.path("Year").asText().substring(0, 4));
                                releaseDate = LocalDate.of(year, 1, 1);
                            } catch (Exception ignored) {}
                        }
                    }
                }
            }

            // Extract Box Office
            String boxOffice = null;
            if (response.has("BoxOffice")) {
                String bo = response.path("BoxOffice").asText();
                if (bo != null && !bo.isBlank() && !"N/A".equalsIgnoreCase(bo)) {
                    boxOffice = bo;
                }
            }

            String imdbId = response.has("imdbID") ? response.path("imdbID").asText() : null;

            return new ImdbMetadataDto(
                    true,
                    response.path("Title").asText(title),
                    posterUrl,
                    imdbRating,
                    description,
                    leadActors,
                    director,
                    genre,
                    releaseDate,
                    boxOffice,
                    imdbId,
                    "Successfully fetched IMDb official metadata"
            );

        } catch (Exception e) {
            log.error("Failed to fetch IMDb metadata for '{}': {}", title, e.getMessage());
            return ImdbMetadataDto.notFound("Error contacting IMDb API: " + e.getMessage());
        }
    }

    /**
     * Synchronizes a single movie by ID with its official IMDb data and poster.
     */
    @Transactional
    public Movie syncMovieById(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie with ID " + movieId + " not found"));

        ImdbMetadataDto meta = fetchMovieMetadata(movie.getTitle());
        if (!meta.found()) {
            throw new IllegalStateException("IMDb sync failed: " + meta.message());
        }

        if (meta.posterUrl() != null) {
            movie.setPosterUrl(meta.posterUrl());
        }
        if (meta.imdbRating() != null) {
            movie.setImdbRating(meta.imdbRating());
        }
        if (meta.description() != null) {
            movie.setDescription(meta.description());
        }
        if (meta.leadActors() != null) {
            movie.setLeadActors(meta.leadActors());
        }
        if (meta.director() != null) {
            movie.setDirector(meta.director());
        }
        if (meta.genre() != null) {
            movie.setGenre(meta.genre());
        }
        if (meta.boxOffice() != null) {
            movie.setBoxOfficeMetrics(meta.boxOffice());
        }
        if (meta.releaseDate() != null) {
            movie.setReleaseDate(meta.releaseDate());
        }

        return movieRepository.save(movie);
    }

    /**
     * Automatically iterates and synchronizes all movies with official IMDb posters and details.
     */
    @Transactional
    public Map<String, Object> syncAllMovies() {
        Map<String, Object> result = new HashMap<>();

        if (!isApiKeyConfigured()) {
            result.put("status", "error");
            result.put("message", "IMDb API key is not configured. Please set IMDB_API_KEY.");
            return result;
        }

        List<Movie> allMovies = movieRepository.findAll();
        int updatedCount = 0;
        int failedCount = 0;

        for (Movie movie : allMovies) {
            try {
                ImdbMetadataDto meta = fetchMovieMetadata(movie.getTitle());
                if (meta.found()) {
                    if (meta.posterUrl() != null) movie.setPosterUrl(meta.posterUrl());
                    if (meta.imdbRating() != null) movie.setImdbRating(meta.imdbRating());
                    if (meta.description() != null) movie.setDescription(meta.description());
                    if (meta.leadActors() != null) movie.setLeadActors(meta.leadActors());
                    if (meta.director() != null) movie.setDirector(meta.director());
                    if (meta.genre() != null) movie.setGenre(meta.genre());
                    if (meta.boxOffice() != null) movie.setBoxOfficeMetrics(meta.boxOffice());
                    movieRepository.save(movie);
                    updatedCount++;
                } else {
                    failedCount++;
                }
                // Gentle sleep to avoid rate limiting
                Thread.sleep(80);
            } catch (Exception e) {
                log.warn("Failed sync for movie '{}': {}", movie.getTitle(), e.getMessage());
                failedCount++;
            }
        }

        result.put("status", "success");
        result.put("total", allMovies.size());
        result.put("updated", updatedCount);
        result.put("failed", failedCount);
        result.put("message", "Synchronized " + updatedCount + " of " + allMovies.size() + " movies with official IMDb data.");
        return result;
    }
}
