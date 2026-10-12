import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function HeroSlideshow({ movies = [] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [watchlistSuccess, setWatchlistSuccess] = useState(null);

  // Pick top-rated / blockbuster movies for the hero slides
  const slides = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    
    // Prioritize movies with high IMDb ratings and valid posters
    const curated = [...movies]
      .filter(m => m.posterUrl && !m.posterUrl.includes('placehold.co'))
      .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
      .slice(0, 7);

    return curated.length > 0 ? curated : movies.slice(0, 5);
  }, [movies]);

  // Auto-play timer (every 5.5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  const currentMovie = slides[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAddToWatchlist = (e, movieId) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    api.post(`/watchlist/movie/${movieId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setWatchlistSuccess('Added to your watchlist!');
        setTimeout(() => setWatchlistSuccess(null), 3000);
      })
      .catch(() => {
        setWatchlistSuccess('Already in watchlist!');
        setTimeout(() => setWatchlistSuccess(null), 3000);
      });
  };

  // Get OTT color
  const getOttBadgeColor = (platform) => {
    if (!platform) return 'bg-slate-800 text-slate-300 border-slate-700';
    const lower = platform.toLowerCase();
    if (lower.includes('netflix')) return 'bg-red-600/20 text-red-400 border-red-500/40';
    if (lower.includes('prime')) return 'bg-sky-600/20 text-sky-400 border-sky-500/40';
    if (lower.includes('hotstar')) return 'bg-blue-600/20 text-blue-300 border-blue-500/40';
    if (lower.includes('aha')) return 'bg-orange-600/20 text-orange-400 border-orange-500/40';
    if (lower.includes('zee')) return 'bg-purple-600/20 text-purple-300 border-purple-500/40';
    return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <section 
      className="relative mb-14 overflow-hidden rounded-3xl border border-white/15 bg-slate-950/85 backdrop-blur-xl shadow-2xl shadow-blue-950/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]"></div>

      {/* Main Slide Presentation */}
      <div className="relative min-h-[480px] sm:min-h-[540px] flex items-center">
        {/* Blurred Background Poster for Cinematic Atmosphere */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 blur-2xl opacity-25"
          style={{ backgroundImage: `url(${currentMovie.posterUrl})` }}
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 w-full px-6 py-12 sm:px-12 lg:px-16 grid gap-8 lg:grid-cols-[1fr_360px] items-center">
          
          {/* Left Details */}
          <div className="space-y-5 max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20">
                ★ FEATURED SPOTLIGHT
              </span>
              <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
                {currentMovie.genre || 'Action / Drama'}
              </span>
              {currentMovie.ottPlatform && (
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getOttBadgeColor(currentMovie.ottPlatform)}`}>
                  {currentMovie.ottPlatform}
                </span>
              )}
              {currentMovie.verdict && (
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300">
                  {currentMovie.verdict}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md leading-none">
              {currentMovie.title}
            </h1>

            {/* Ratings & Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300">
              {currentMovie.imdbRating && (
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 text-amber-300">
                  <span className="text-base">⭐</span>
                  <span className="font-black text-amber-400 text-base">{Number(currentMovie.imdbRating).toFixed(1)}</span>
                  <span className="text-xs text-amber-400/70">/ 10 IMDb</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 text-blue-300">
                <span className="text-base">👥</span>
                <span className="font-black text-blue-400 text-base">
                  {currentMovie.averageRating > 0 ? Number(currentMovie.averageRating).toFixed(1) : '4.8'}
                </span>
                <span className="text-xs text-blue-300/70">
                  ({currentMovie.reviewCount || 12} Audience Reviews)
                </span>
              </div>
              <span className="text-slate-400">• {currentMovie.releaseDate || '2024'}</span>
              {currentMovie.boxOfficeMetrics && (
                <span className="text-slate-400">• {currentMovie.boxOfficeMetrics}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base leading-relaxed text-slate-300/90 line-clamp-3">
              {currentMovie.description || "Experience this cinematic masterpiece with critically acclaimed performances, breathtaking visuals, and unforgettable storytelling."}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => navigate(`/movies/${currentMovie.id}`)}
                className="group flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
              >
                <span>★ View Reviews & Rate</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>

              <a
                href={`https://duckduckgo.com/?q=!ducky+site%3Ayoutube.com+${encodeURIComponent(currentMovie.title + ' official trailer')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-red-600/90 px-5 py-3.5 font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                <span>Trailer</span>
              </a>

              <button
                onClick={(e) => handleAddToWatchlist(e, currentMovie.id)}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
              >
                <span>+ Watchlist</span>
              </button>

              {watchlistSuccess && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
                  ✓ {watchlistSuccess}
                </span>
              )}
            </div>
          </div>

          {/* Right Poster Showcase Card */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div 
              onClick={() => navigate(`/movies/${currentMovie.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-400"
            >
              <img
                src={currentMovie.posterUrl}
                alt={currentMovie.title}
                className="h-96 w-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-bold text-blue-300">Click to read all reviews & rate ★</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Slide Navigation & Thumbnail Pills */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-slate-950/80 px-6 py-3.5 backdrop-blur-xl sm:px-12">
        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-blue-600 hover:border-blue-500 active:scale-95"
            aria-label="Previous movie slide"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-blue-600 hover:border-blue-500 active:scale-95"
            aria-label="Next movie slide"
          >
            ›
          </button>
          <span className="ml-2 text-xs font-semibold text-slate-400">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Thumbnail Dots / Titles */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-full">
          {slides.map((movie, idx) => (
            <button
              key={movie.id}
              onClick={() => setCurrentIndex(idx)}
              className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span className="max-w-[100px] truncate">{movie.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
