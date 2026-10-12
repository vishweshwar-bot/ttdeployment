package com.audiensense.service;

import com.audiensense.dto.ReviewRequest;
import com.audiensense.dto.ReviewResponse;
import com.audiensense.entity.Movie;
import com.audiensense.entity.Review;
import com.audiensense.entity.User;
import com.audiensense.repository.MovieRepository;
import com.audiensense.repository.ReviewRepository;
import com.audiensense.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         MovieRepository movieRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewResponse> getReviews(Long movieId) {
        return reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<com.audiensense.dto.UserReviewResponse> getUserReviews(String username) {
        return reviewRepository.findByUserUsernameOrderByCreatedAtDesc(username).stream()
                .map(review -> new com.audiensense.dto.UserReviewResponse(
                        review.getId(),
                        review.getMovie().getId(),
                        review.getMovie().getTitle(),
                        review.getMovie().getPosterUrl(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String username) {
        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String commentText = (request.comment() != null) ? request.comment().trim() : "";
        Review review = new Review(
                movie,
                user,
                request.rating(),
                commentText);
        reviewRepository.save(review);
        return toResponse(review);
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getMovie().getId(),
                review.getUsername(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
