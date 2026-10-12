import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import HeroSlideshow from './HeroSlideshow';

function PosterImage({ src, alt, title }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-72 w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 text-center">
        <div>
          <div className="mb-3 text-4xl">🎬</div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">No Poster</p>
          <p className="mt-2 text-xs text-slate-500 line-clamp-2">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      className="h-72 w-full object-cover transition duration-500 ease-out group-hover:scale-108"
    />
  );
}

function MovieCard({ movie, onSelect }) {
  // Get OTT color
  const getOttBadge = (platform) => {
    if (!platform) return null;
    const lower = platform.toLowerCase();
    let colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (lower.includes('netflix')) colorClass = 'bg-red-500/20 text-red-300 border-red-500/30';
    else if (lower.includes('prime')) colorClass = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    else if (lower.includes('hotstar')) colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    else if (lower.includes('aha')) colorClass = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    else if (lower.includes('zee')) colorClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';

    return (
      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${colorClass}`}>
        {platform}
      </span>
    );
  };

  const audienceRating = movie.averageRating > 0 ? Number(movie.averageRating).toFixed(1) : null;
  const imdbRating = movie.imdbRating ? Number(movie.imdbRating).toFixed(1) : null;

  return (
    <article
      onClick={() => onSelect(movie.id)}
      className="audien-card group cursor-pointer w-[78vw] shrink-0 overflow-hidden rounded-2xl sm:w-72 relative"
    >
      <div className="relative overflow-hidden">
        <PosterImage src={movie.posterUrl || movie.poster_url} alt={`${movie.title} poster`} title={movie.title} />

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 transform scale-75 group-hover:scale-100 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Tags Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 pt-12 flex flex-wrap gap-1.5 items-end">
          <span className="rounded-full bg-blue-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {movie.genre ? movie.genre.split('/')[0] : 'Feature'}
          </span>
          {getOttBadge(movie.ottPlatform)}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="audien-card-title truncate text-base sm:text-lg font-bold group-hover:text-blue-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs font-semibold text-slate-400">
          <span>{movie.releaseDate ? movie.releaseDate.split('-')[0] : 'TBA'}</span>
          
          <div className="flex items-center gap-2">
            {audienceRating && (
              <span className="flex items-center gap-1 text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                👥 {audienceRating}
              </span>
            )}
            <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              ⭐ {imdbRating || '0.0'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Carousel({ title, description, movies, onSelect }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies.length) return null;

  return (
    <section className="mb-12 group">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.28em] text-blue-400">{description}</p>
          <h2 className="audien-section-title mt-1.5 text-2xl font-black text-white">{title}</h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-slate-500 mr-2">Swipe to explore</span>
          <button 
            onClick={() => scroll('left')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 shadow-sm transition hover:scale-105 hover:border-blue-500 hover:text-white hover:bg-blue-600 focus:outline-none active:scale-95"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button 
            onClick={() => scroll('right')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 shadow-sm transition hover:scale-105 hover:border-blue-500 hover:text-white hover:bg-blue-600 focus:outline-none active:scale-95"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>
      <div className="relative">
        <div 
          ref={scrollRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth"
        >
          {movies.map(movie => <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />)}
        </div>
      </div>
    </section>
  );
}

export default function MovieDashboard() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    // Instantly display cached movies if available (0ms load time)
    try {
      const cached = localStorage.getItem('audiensense_movies_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMovies(parsed);
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    api.get('/movies?page=0&size=150')
      .then(response => {
        let data = Array.isArray(response.data) ? response.data : response.data.content || [];
        // Sort movies by release date (newest first)
        data = data.sort((a, b) => {
          if (!a.releaseDate) return 1;
          if (!b.releaseDate) return -1;
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        });
        if (active) {
          setMovies(data);
          try {
            localStorage.setItem('audiensense_movies_cache', JSON.stringify(data));
          } catch (e) {
            console.warn('Cache write error:', e);
          }
        }
      })
      .catch(requestError => active && setError(requestError.response?.data?.message || 'Unable to connect to backend server.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const allUniqueGenres = useMemo(() => {
    const genreSet = new Set();
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split('/').forEach(g => genreSet.add(g.trim()));
      }
    });
    return ['All', ...Array.from(genreSet).sort()];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return movies.filter(movie => {
      const matchesSearch = !normalizedSearch
        || (movie.title && movie.title.toLowerCase().includes(normalizedSearch))
        || (movie.genre && movie.genre.toLowerCase().includes(normalizedSearch));
      
      const movieGenres = movie.genre ? movie.genre.split('/').map(g => g.trim()) : [];
      const matchesGenre = selectedGenre === 'All' || movieGenres.includes(selectedGenre);
      
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchTerm, selectedGenre]);

  const trending = useMemo(() => {
    return [...movies].sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0)).slice(0, 10);
  }, [movies]);

  const newReleases = useMemo(() => {
    return movies.slice(0, 8);
  }, [movies]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
  };

  return (
    <main className="audien-dashboard min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Cinematic Auto-rotating Hero Slideshow */}
        {!searchTerm && selectedGenre === 'All' && movies.length > 0 && (
          <HeroSlideshow movies={movies} />
        )}

        {/* Filter and Search Panel */}
        <div className="audien-panel mb-12 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Search & Explore</p>
              <h2 className="mt-1 text-2xl font-black text-white">Find Movies, Reviews & Ratings</h2>
            </div>
            <div className="relative w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">⌕</span>
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by title, genre, director or cast..."
                className="audien-search w-full rounded-xl px-11 py-3.5 text-sm outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Genre Filters Bar */}
          <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {allUniqueGenres.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`audien-genre rounded-full px-3.5 py-1.5 text-xs font-semibold ${selectedGenre === genre ? 'audien-genre-active' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Carousels for Home View */}
        {!searchTerm && selectedGenre === 'All' && (
          <>
            <Carousel title="Trending Blockbusters" description="Top Rated by Critics & Audiences" movies={trending} onSelect={id => navigate(`/movies/${id}`)} />
            <Carousel title="Fresh Releases" description="Newly Added to the Catalog" movies={newReleases} onSelect={id => navigate(`/movies/${id}`)} />
          </>
        )}

        {/* Loading and Error Feedback */}
        {loading && (
          <div className="audien-panel rounded-2xl p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-base font-semibold text-slate-200">Loading movie catalog...</p>
            <p className="mt-1 text-xs text-slate-400">Syncing latest reviews and box office metrics...</p>
          </div>
        )}
        
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm font-semibold text-red-400">{error}</div>}

        {/* All Movies Grid View */}
        {!loading && !error && (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Collection</p>
                <h2 className="audien-section-title mt-1.5 text-3xl font-black text-white">
                  {searchTerm || selectedGenre !== 'All' ? 'Search Results' : 'Complete Movie Library'}
                </h2>
              </div>
              {(searchTerm || selectedGenre !== 'All') && (
                <button 
                  type="button" 
                  onClick={resetFilters} 
                  className="audien-button rounded-xl px-4 py-2 text-xs font-bold"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredMovies.length === 0 ? (
              <div className="audien-empty rounded-2xl p-12 text-center text-slate-400 font-medium">
                No movies match your search. Try searching for another title or genre.
              </div>
            ) : (searchTerm || selectedGenre !== 'All') ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMovies.map(movie => <MovieCard key={movie.id} movie={movie} onSelect={id => navigate(`/movies/${id}`)} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {allUniqueGenres.filter(g => g !== 'All').map(genre => {
                  const genreMovies = filteredMovies.filter(m => m.genre && m.genre.split('/').map(x => x.trim()).includes(genre));
                  if (genreMovies.length === 0) return null;
                  return (
                    <Carousel 
                      key={genre} 
                      title={genre} 
                      description="Genre Showcase" 
                      movies={genreMovies} 
                      onSelect={id => navigate(`/movies/${id}`)} 
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}
