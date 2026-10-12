package com.audiensense.controller;

import com.audiensense.dto.ReviewRequest;
import com.audiensense.dto.ReviewResponse;
import com.audiensense.entity.Movie;
import com.audiensense.entity.Review;
import com.audiensense.entity.User;
import com.audiensense.repository.MovieRepository;
import com.audiensense.repository.ReviewRepository;
import com.audiensense.repository.UserRepository;
import com.audiensense.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewService reviewService, MovieRepository movieRepository, UserRepository userRepository, ReviewRepository reviewRepository) {
        this.reviewService = reviewService;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/movie/{movieId}")
    public List<ReviewResponse> getReviews(@PathVariable Long movieId) {
        return reviewService.getReviews(movieId);
    }

    @GetMapping("/user")
    public ResponseEntity<List<com.audiensense.dto.UserReviewResponse>> getUserReviews() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reviewService.getUserReviews(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Movie movie = movieRepository.findById(request.movieId()).orElse(null);
            if (movie == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String commentText = (request.comment() != null) ? request.comment().trim() : "";
            Review review = new Review(movie, user, request.rating(), commentText);
            reviewRepository.save(review);

            ReviewResponse response = new ReviewResponse(
                    review.getId(),
                    review.getMovie().getId(),
                    review.getUsername(),
                    review.getRating(),
                    review.getComment(),
                    review.getCreatedAt()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception error) {
            System.out.println("Review submission failed for movieId=" + request.movieId());
            error.printStackTrace(System.out);
            return ResponseEntity.internalServerError().build();
        }
    }
}
