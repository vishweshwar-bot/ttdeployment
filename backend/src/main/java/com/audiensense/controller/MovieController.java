package com.audiensense.controller;

import com.audiensense.dto.MovieRequest;
import com.audiensense.dto.MovieResponse;
import com.audiensense.service.MovieService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;
    private final com.audiensense.service.ImdbSyncService imdbSyncService;

    public MovieController(MovieService movieService, com.audiensense.service.ImdbSyncService imdbSyncService) {
        this.movieService = movieService;
        this.imdbSyncService = imdbSyncService;
    }

    @GetMapping
    public Page<MovieResponse> getMovies(@RequestParam(required = false) String search,
                                         Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by("releaseDate").descending());
        }
        return movieService.getMovies(search, pageable);
    }

    @GetMapping("/filter")
    public Page<MovieResponse> filterMovies(@RequestParam(required = false) String search,
                                            @RequestParam(required = false) String genre,
                                            Pageable pageable) {
        return movieService.filterMovies(search, genre, pageable);
    }

    @GetMapping("/trending")
    public List<MovieResponse> getTrending(@RequestParam(defaultValue = "8") int size) {
        return movieService.getTrending(size);
    }

    @GetMapping("/new-releases")
    public List<MovieResponse> getNewReleases(@RequestParam(defaultValue = "8") int size) {
        return movieService.getNewReleases(size);
    }

    @GetMapping("/imdb-status")
    public ResponseEntity<?> getImdbStatus() {
        return ResponseEntity.ok(java.util.Map.of(
                "configured", imdbSyncService.isApiKeyConfigured(),
                "message", imdbSyncService.isApiKeyConfigured()
                        ? "IMDb API key is active"
                        : "IMDb API key is not configured. Add IMDB_API_KEY in .env or Render dashboard."
        ));
    }

    @GetMapping("/imdb-preview")
    public ResponseEntity<?> getImdbPreview(@RequestParam String title) {
        return ResponseEntity.ok(imdbSyncService.fetchMovieMetadata(title));
    }

    @PostMapping("/sync-imdb/{id}")
    public ResponseEntity<?> syncMovieImdb(@PathVariable Long id) {
        try {
            var updated = imdbSyncService.syncMovieById(id);
            return ResponseEntity.ok(movieService.getMovie(updated.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sync-imdb-all")
    public ResponseEntity<?> syncAllMoviesImdb() {
        return ResponseEntity.ok(imdbSyncService.syncAllMovies());
    }

    @GetMapping("/{id}")
    @PermitAll
    public MovieResponse getMovie(@PathVariable Long id) {
        return movieService.getMovie(id);
    }

    @PostMapping
    @Secured("ROLE_SYSTEM_ADMIN")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.createMovie(request));
    }
}
