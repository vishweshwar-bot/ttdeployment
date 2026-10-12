import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function PosterImage({ src, alt, title }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-72 w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6 text-center">
        <div>
          <div className="mb-3 text-4xl">🎬</div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">No Poster</p>
          <p className="mt-2 text-xs text-slate-400">{title}</p>
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
      className="h-72 w-full object-cover transition duration-500 ease-out group-hover:scale-110"
    />
  );
}

function MovieCard({ movie, onSelect }) {
  return (
    <article
      onClick={() => onSelect(movie.id)}
      className="audien-card group cursor-pointer w-[78vw] shrink-0 overflow-hidden rounded-2xl sm:w-72"
    >
      <div className="relative overflow-hidden">
        <PosterImage src={movie.posterUrl || movie.poster_url} alt={`${movie.title} poster`} title={movie.title} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 pt-20 flex gap-2">
          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {movie.genre || 'Drama'}
          </span>
          {movie.ottPlatform && (
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400 border border-slate-700">
              {movie.ottPlatform}
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="audien-card-title truncate text-lg font-bold">{movie.title}</h3>
        <div className="audien-card-meta mt-3 flex items-center justify-between gap-2 text-xs">
          <span>{movie.releaseDate || 'TBA'}</span>
          <span className="audien-card-rating">⭐ {movie.imdbRating ? Number(movie.imdbRating).toFixed(1) : '0.0'}</span>
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
    <section className="mb-10 group">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.28em]">{description}</p>
          <h2 className="audien-section-title mt-2 text-2xl font-black">{title}</h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-slate-500 mr-2">Swipe to explore</span>
          <button 
            onClick={() => scroll('left')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:scale-105 hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:scale-105 hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          </button>
        </div>
      </div>
      <div className="relative">
        <div 
          ref={scrollRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scroll-smooth"
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

  const trending = movies ? movies.slice(0, 8) : [];
  const newReleases = movies ? movies.slice(0, 4) : [];
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
  };

  return (
    <main className="audien-dashboard min-h-screen overflow-hidden">
      <section className="audien-hero px-5 py-16 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-600">Curated for every screen</p>
          <h1 className="audien-hero-title mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Discover your next <span>story.</span></h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">Explore the newest releases, critically loved favorites, and the latest audiences are talking about.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="audien-panel mb-10 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Find your movie</p>
              <h2 className="mt-1 text-2xl font-bold">Search the catalog</h2>
            </div>
            <div className="relative w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by title or genre..."
                className="audien-search w-full rounded-xl px-11 py-3.5 text-sm outline-none transition placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {allUniqueGenres.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`audien-genre rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedGenre === genre ? 'audien-genre-active' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {!searchTerm && selectedGenre === 'All' && (
          <>
            <Carousel title="New Releases" description="Fresh from the studio" movies={newReleases} onSelect={id => navigate(`/movies/${id}`)} />
            <Carousel title="Trending Now" description="Audience favorites" movies={trending} onSelect={id => navigate(`/movies/${id}`)} />
          </>
        )}

        {loading && (
          <div className="audien-panel rounded-2xl p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-base font-semibold text-slate-700">Loading movie catalog...</p>
            <p className="mt-1 text-xs text-slate-400">If the server was sleeping (Render free tier), it may take 30-45 seconds to wake up.</p>
          </div>
        )}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">{error}</div>}
        {!loading && !error && <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.3em]">Explore the collection</p>
              <h2 className="audien-section-title mt-2 text-3xl font-black">
                {searchTerm || selectedGenre !== 'All' ? 'Search Results' : 'Movie Catalogs'}
              </h2>
            </div>
            {(searchTerm || selectedGenre !== 'All') && (
              <button type="button" onClick={resetFilters} className="audien-button rounded-lg px-4 py-2 text-sm font-semibold">Clear filters</button>
            )}
          </div>

          {filteredMovies.length === 0 ? (
            <div className="audien-empty rounded-2xl p-10 text-center">No movies match your search. Try another title or genre.</div>
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
                    description="Catalog" 
                    movies={genreMovies} 
                    onSelect={id => navigate(`/movies/${id}`)} 
                  />
                );
              })}
            </div>
          )}
        </section>}
      </div>
    </main>
  );
}
