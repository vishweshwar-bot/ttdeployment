package com.audiensense.controller;

import com.audiensense.dto.TvShowResponse;
import com.audiensense.service.TvShowService;
import jakarta.annotation.security.PermitAll;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/tv-shows")
public class TvShowController {

    private final TvShowService tvShowService;

    public TvShowController(TvShowService tvShowService) {
        this.tvShowService = tvShowService;
    }

    @GetMapping
    public Page<TvShowResponse> getTvShows(@RequestParam(required = false) String search, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("releaseDate").descending());
        }
        return tvShowService.getTvShows(search, pageable);
    }

    @GetMapping("/filter")
    public Page<TvShowResponse> filterTvShows(@RequestParam(required = false) String search,
                                                @RequestParam(required = false) String genre,
                                                Pageable pageable) {
        return tvShowService.filterTvShows(search, genre, pageable);
    }

    @GetMapping("/{id}")
    @PermitAll
    public TvShowResponse getTvShow(@PathVariable Long id) {
        return tvShowService.getTvShow(id);
    }
}
