package com.audiensense.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "movies", uniqueConstraints = @UniqueConstraint(name = "uk_movie_title", columnNames = "title"))
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private LocalDate releaseDate;

    @Column(nullable = false)
    private String boxOfficeMetrics;

    @Column(nullable = false)
    private String posterUrl;

    @Column(nullable = true)
    private Double imdbRating;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = true)
    private String leadActors;

    @Column(nullable = true)
    private String director;

    @Column(nullable = true)
    private String verdict;

    @Column(nullable = true)
    private String seasonsEpisodes;

    @Column(nullable = true)
    private String ottPlatform;

    @OneToMany(mappedBy = "movie", fetch = jakarta.persistence.FetchType.LAZY)
    private List<Review> reviews = new java.util.ArrayList<>();

    protected Movie() {
    }

    public Movie(String title, String genre, LocalDate releaseDate, String boxOfficeMetrics, String posterUrl) {
        this(title, genre, releaseDate, boxOfficeMetrics, posterUrl, null, null, null, null, null, null, null);
    }

    public Movie(String title, String genre, LocalDate releaseDate, String boxOfficeMetrics,
                 String posterUrl, Double imdbRating, String description, String leadActors, String director, String verdict, String seasonsEpisodes, String ottPlatform) {
        this.title = title;
        this.genre = genre;
        this.releaseDate = releaseDate;
        this.boxOfficeMetrics = boxOfficeMetrics;
        this.posterUrl = posterUrl;
        this.imdbRating = imdbRating;
        this.description = description;
        this.leadActors = leadActors;
        this.director = director;
        this.verdict = verdict;
        this.seasonsEpisodes = seasonsEpisodes;
        this.ottPlatform = ottPlatform;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getBoxOfficeMetrics() {
        return boxOfficeMetrics;
    }

    public void setBoxOfficeMetrics(String boxOfficeMetrics) {
        this.boxOfficeMetrics = boxOfficeMetrics;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public Double getImdbRating() {
        return imdbRating;
    }

    public void setImdbRating(Double imdbRating) {
        this.imdbRating = imdbRating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLeadActors() {
        return leadActors;
    }

    public void setLeadActors(String leadActors) {
        this.leadActors = leadActors;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public String getVerdict() {
        return verdict;
    }

    public void setVerdict(String verdict) {
        this.verdict = verdict;
    }

    public String getSeasonsEpisodes() {
        return seasonsEpisodes;
    }

    public void setSeasonsEpisodes(String seasonsEpisodes) {
        this.seasonsEpisodes = seasonsEpisodes;
    }

    public String getOttPlatform() {
        return ottPlatform;
    }

    public void setOttPlatform(String ottPlatform) {
        this.ottPlatform = ottPlatform;
    }

    @JsonIgnore
    public List<Review> getReviews() {
        return reviews;
    }

    public void update(String title, String genre, LocalDate releaseDate, String boxOfficeMetrics, String posterUrl, String leadActors, String director, String verdict, String seasonsEpisodes, String ottPlatform) {
        this.title = title;
        this.genre = genre;
        this.releaseDate = releaseDate;
        this.boxOfficeMetrics = boxOfficeMetrics;
        this.posterUrl = posterUrl;
        this.leadActors = leadActors;
        this.director = director;
        this.verdict = verdict;
        this.seasonsEpisodes = seasonsEpisodes;
        this.ottPlatform = ottPlatform;
    }
}
