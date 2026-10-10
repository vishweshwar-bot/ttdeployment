package com.audiensense.service;

import com.audiensense.dto.AdminReviewResponse;
import com.audiensense.dto.MovieRequest;
import com.audiensense.dto.MovieResponse;
import com.audiensense.entity.Movie;
import com.audiensense.entity.Review;
import com.audiensense.entity.User;
import com.audiensense.repository.MovieRepository;
import com.audiensense.repository.ReviewRepository;
import com.audiensense.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public AdminService(MovieRepository movieRepository,
                        ReviewRepository reviewRepository,
                        UserRepository userRepository) {
        this.movieRepository = movieRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public long getRegisteredUserCount() {
        return userRepository.count();
    }

    public List<MovieResponse> getMovies() {
        return movieRepository.findAll().stream().map(this::toResponse).toList();
    }

    public MovieResponse createMovie(MovieRequest request) {
        if (movieRepository.existsByTitle(request.title().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A movie with this title already exists");
        }
        return toResponse(movieRepository.save(new Movie(
                request.title().trim(),
                request.genre().trim(),
                request.releaseDate(),
                request.boxOfficeMetrics().trim(),
                request.posterUrl().trim(),
                null,
                null,
                request.leadActors() != null ? request.leadActors().trim() : null,
                request.director() != null ? request.director().trim() : null,
                request.verdict() != null ? request.verdict().trim() : null,
                request.seasonsEpisodes() != null ? request.seasonsEpisodes().trim() : null,
                request.ottPlatform() != null ? request.ottPlatform().trim() : null
        )));
    }

    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
        movie.update(
                request.title().trim(),
                request.genre().trim(),
                request.releaseDate(),
                request.boxOfficeMetrics().trim(),
                request.posterUrl().trim(),
                request.leadActors() != null ? request.leadActors().trim() : null,
                request.director() != null ? request.director().trim() : null,
                request.verdict() != null ? request.verdict().trim() : null,
                request.seasonsEpisodes() != null ? request.seasonsEpisodes().trim() : null,
                request.ottPlatform() != null ? request.ottPlatform().trim() : null
        );
        return toResponse(movieRepository.save(movie));
    }

    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
        movieRepository.delete(movie);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public List<AdminReviewResponse> getReviews() {
        return reviewRepository.findAll().stream()
                .map(review -> new AdminReviewResponse(
                        review.getId(), review.getUsername(), review.getMovie().getTitle(),
                        review.getRating(), review.getComment()))
                .toList();
    }

    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        reviewRepository.delete(review);
    }

    private MovieResponse toResponse(Movie movie) {
        double averageRating = movieRepository.findById(movie.getId())
                .map(item -> item.getReviews().stream()
                        .mapToDouble(Review::getRating)
                        .average()
                        .orElse(0.0))
                .orElse(0.0);
        int reviewCount = movieRepository.findById(movie.getId())
                .map(item -> item.getReviews().size())
                .orElse(0);
        return new MovieResponse(
                movie.getId(), movie.getTitle(), movie.getGenre(), movie.getReleaseDate(),
                movie.getBoxOfficeMetrics(), movie.getPosterUrl(), averageRating, reviewCount,
                movie.getImdbRating(), movie.getDescription(), movie.getLeadActors(), movie.getDirector(), 
                movie.getVerdict(), movie.getSeasonsEpisodes(), movie.getOttPlatform());
    }
}
