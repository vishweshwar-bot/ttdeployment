package com.audiensense.repository;

import com.audiensense.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    boolean existsByTitle(String title);

    Optional<Movie> findByTitleIgnoreCase(String title);

    Page<Movie> findByTitleContainingIgnoreCaseOrGenreContainingIgnoreCase(
            String title, String genre, Pageable pageable);

    @EntityGraph(attributePaths = "reviews")
    Page<Movie> findByOrderByReleaseDateDesc(Pageable pageable);

    List<Movie> findByOrderByReleaseDateDesc();

    @EntityGraph(attributePaths = "reviews")
    @Query("select m from Movie m order by m.releaseDate desc")
    List<Movie> findNewReleases();

    @EntityGraph(attributePaths = "reviews")
    @Query("select distinct m from Movie m left join m.reviews r "
            + "order by avg(r.rating) desc, m.releaseDate desc")
    List<Movie> findTrending();

    @EntityGraph(attributePaths = "reviews")
    @Query("select m from Movie m where lower(m.title) like lower(concat('%', :search, '%')) "
            + "or lower(m.genre) like lower(concat('%', :search, '%'))")
    Page<Movie> findBySearch(@Param("search") String search, Pageable pageable);

    @EntityGraph(attributePaths = "reviews")
    @Query("select m from Movie m where (:search is null or :search = '' "
            + "or lower(m.title) like lower(concat('%', :search, '%')) "
            + "or lower(m.genre) like lower(concat('%', :search, '%'))) "
            + "and (:genre is null or :genre = '' or lower(m.genre) = lower(:genre))")
    Page<Movie> findFiltered(@Param("search") String search,
                             @Param("genre") String genre,
                             Pageable pageable);

    @EntityGraph(attributePaths = "reviews")
    @Override
    Optional<Movie> findById(Long id);
}
