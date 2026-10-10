package com.audiensense.repository;

import com.audiensense.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = "movie")
    List<Review> findByMovieIdOrderByCreatedAtDesc(Long movieId);

    @EntityGraph(attributePaths = "movie")
    List<Review> findByUserUsernameOrderByCreatedAtDesc(String username);

    @EntityGraph(attributePaths = "movie")
    @Override
    List<Review> findAll();
}
