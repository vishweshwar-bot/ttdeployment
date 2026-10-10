package com.audiensense.controller;

import com.audiensense.dto.WatchlistItemResponse;
import com.audiensense.service.WatchlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/watchlist")
@CrossOrigin(origins = "*")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public List<WatchlistItemResponse> getWatchlist() {
        return watchlistService.getCurrentUserWatchlist(currentUsername());
    }

    @PostMapping("/movie/{movieId}")
    public ResponseEntity<WatchlistItemResponse> addMovieToWatchlist(@PathVariable Long movieId) {
        WatchlistItemResponse item = watchlistService.addMovieToWatchlist(currentUsername(), movieId);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @DeleteMapping("/{watchlistId}")
    public ResponseEntity<Void> removeMovieFromWatchlist(@PathVariable Long watchlistId) {
        watchlistService.removeMovieFromWatchlist(currentUsername(), watchlistId);
        return ResponseEntity.noContent().build();
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return authentication.getName();
    }
}
