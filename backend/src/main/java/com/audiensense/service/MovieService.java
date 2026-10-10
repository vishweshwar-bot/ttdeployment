package com.audiensense.service;

import com.audiensense.dto.MovieRequest;
import com.audiensense.dto.MovieResponse;
import com.audiensense.entity.Movie;
import com.audiensense.entity.Review;
import com.audiensense.repository.MovieRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public Page<MovieResponse> getMovies(String search, Pageable pageable) {
        Page<Movie> movies = search == null || search.isBlank()
                ? movieRepository.findByOrderByReleaseDateDesc(pageable)
                : movieRepository.findBySearch(search.trim(), pageable);
        return movies.map(this::toResponse);
    }

    public Page<MovieResponse> filterMovies(String search, String genre, Pageable pageable) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        String normalizedGenre = genre == null || genre.isBlank() ? null : genre.trim();
        return movieRepository.findFiltered(normalizedSearch, normalizedGenre, pageable)
                .map(this::toResponse);
    }

    public List<MovieResponse> getTrending(int size) {
        validateSize(size);
        return movieRepository.findTrending().stream()
                .limit(size)
                .map(this::toResponse)
                .toList();
    }

    public List<MovieResponse> getNewReleases(int size) {
        validateSize(size);
        return movieRepository.findNewReleases().stream()
                .limit(size)
                .map(this::toResponse)
                .toList();
    }

    public MovieResponse getMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
        return toResponse(movie);
    }

    public MovieResponse createMovie(MovieRequest request) {
        if (movieRepository.existsByTitle(request.title().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A movie with this title already exists");
        }

        Movie movie = movieRepository.save(new Movie(
                request.title().trim(),
                request.genre().trim(),
                request.releaseDate(),
                request.boxOfficeMetrics().trim(),
                request.posterUrl().trim(),
                null,
                null,
                request.leadActors(),
                request.director(),
                request.verdict(),
                request.seasonsEpisodes(),
                request.ottPlatform()
        ));
        return toResponse(movie);
    }

    private void validateSize(int size) {
        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Size must be greater than zero");
        }
    }

    private MovieResponse toResponse(Movie movie) {
        double averageRating = movie.getReviews().stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
        return new MovieResponse(
                movie.getId(), movie.getTitle(), movie.getGenre(), movie.getReleaseDate(),
                movie.getBoxOfficeMetrics(), movie.getPosterUrl(), averageRating,
                movie.getReviews().size(), movie.getImdbRating(), movie.getDescription(),
                movie.getLeadActors(), movie.getDirector(), movie.getVerdict(), movie.getSeasonsEpisodes(), movie.getOttPlatform());
    }
}
