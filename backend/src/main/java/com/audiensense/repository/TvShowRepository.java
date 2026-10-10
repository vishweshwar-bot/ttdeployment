package com.audiensense.repository;

import com.audiensense.entity.TvShow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TvShowRepository extends JpaRepository<TvShow, Long> {

    boolean existsByTitle(String title);

    Page<TvShow> findByOrderByReleaseDateDesc(Pageable pageable);

    @Query("select t from TvShow t where lower(t.title) like lower(concat('%', :search, '%')) or lower(t.genre) like lower(concat('%', :search, '%'))")
    Page<TvShow> findBySearch(@Param("search") String search, Pageable pageable);

    @Query("select t from TvShow t where (:genre is null or t.genre = :genre) and (:search is null or (lower(t.title) like lower(concat('%', :search, '%')) or lower(t.genre) like lower(concat('%', :search, '%'))))")
    Page<TvShow> findFiltered(@Param("search") String search, @Param("genre") String genre, Pageable pageable);
}
