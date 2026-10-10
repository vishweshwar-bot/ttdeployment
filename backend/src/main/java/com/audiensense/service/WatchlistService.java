package com.audiensense.service;

import com.audiensense.dto.WatchlistItemResponse;
import com.audiensense.entity.Movie;
import com.audiensense.entity.User;
import com.audiensense.entity.Watchlist;
import com.audiensense.repository.MovieRepository;
import com.audiensense.repository.UserRepository;
import com.audiensense.repository.WatchlistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WatchlistService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final WatchlistRepository watchlistRepository;

    public WatchlistService(UserRepository userRepository,
                            MovieRepository movieRepository,
                            WatchlistRepository watchlistRepository) {
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.watchlistRepository = watchlistRepository;
    }

    public List<WatchlistItemResponse> getCurrentUserWatchlist(String username) {
        User user = findUser(username);
        return watchlistRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public WatchlistItemResponse addMovieToWatchlist(String username, Long movieId) {
        User user = findUser(username);
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        if (watchlistRepository.existsByUserIdAndMovieId(user.getId(), movieId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Movie is already in your watchlist");
        }

        Watchlist entry = watchlistRepository.save(new Watchlist(user, movie));
        return toResponse(entry);
    }

    public void removeMovieFromWatchlist(String username, Long watchlistId) {
        User user = findUser(username);
        Watchlist entry = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist item not found"));

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot remove this watchlist item");
        }

        watchlistRepository.delete(entry);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private WatchlistItemResponse toResponse(Watchlist entry) {
        Movie movie = entry.getMovie();
        return new WatchlistItemResponse(
                entry.getId(),
                movie.getId(),
                movie.getTitle(),
                movie.getGenre(),
                movie.getPosterUrl(),
                entry.getAddedAt()
        );
    }
}
