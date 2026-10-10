package com.audiensense.service;

import com.audiensense.dto.TvShowResponse;
import com.audiensense.entity.TvShow;
import com.audiensense.repository.TvShowRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TvShowService {

    private final TvShowRepository repository;

    public TvShowService(TvShowRepository repository) {
        this.repository = repository;
    }

    public Page<TvShowResponse> getTvShows(String search, Pageable pageable) {
        Page<TvShow> shows = search == null || search.isBlank()
                ? repository.findByOrderByReleaseDateDesc(pageable)
                : repository.findBySearch(search.trim(), pageable);
        return shows.map(this::toResponse);
    }

    public Page<TvShowResponse> filterTvShows(String search, String genre, Pageable pageable) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        String normalizedGenre = genre == null || genre.isBlank() ? null : genre.trim();
        return repository.findFiltered(normalizedSearch, normalizedGenre, pageable)
                .map(this::toResponse);
    }

    public TvShowResponse getTvShow(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TV show not found"));
    }

    private TvShowResponse toResponse(TvShow show) {
        return new TvShowResponse(show.getId(), show.getTitle(), show.getGenre(), show.getReleaseDate(),
                show.getPosterUrl(), show.getNetwork(), show.getSeasons());
    }
}
