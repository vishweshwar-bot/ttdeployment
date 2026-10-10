package com.audiensense.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "tv_shows", uniqueConstraints = @UniqueConstraint(name = "uk_tv_show_title", columnNames = "title"))
public class TvShow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private LocalDate releaseDate;

    @Column(nullable = false, length = 2048)
    private String posterUrl;

    @Column(nullable = false)
    private String network;

    @Column(nullable = false)
    private Integer seasons;

    protected TvShow() {
    }

    public TvShow(String title, String genre, LocalDate releaseDate, String posterUrl, String network, Integer seasons) {
        this.title = title;
        this.genre = genre;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.network = network;
        this.seasons = seasons;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getGenre() { return genre; }
    public LocalDate getReleaseDate() { return releaseDate; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public String getNetwork() { return network; }
    public Integer getSeasons() { return seasons; }
}
