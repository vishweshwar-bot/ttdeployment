import { useState, useEffect, useMemo } from 'react';
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
      className="audien-card group cursor-pointer overflow-hidden rounded-2xl"
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
        <div className="audien-card-meta mt-3 flex items-center justify-between text-xs">
          <span>{movie.releaseDate || 'TBA'}</span>
          <div className="flex flex-col items-end gap-1">
            <span className="audien-card-rating">IMDb: ⭐ {movie.imdbRating ? Number(movie.imdbRating).toFixed(1) : '0.0'}</span>
            <span className="font-semibold text-amber-500">Audien: ⭐ {movie.averageRating ? Number(movie.averageRating).toFixed(1) : '0.0'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TopRated() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get('/movies?page=0&size=150')
      .then(response => {
        let data = Array.isArray(response.data) ? response.data : response.data.content || [];
        if (active) setMovies(data);
      })
      .catch(requestError => active && setError(requestError.response?.data?.message || 'Unable to load movies.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const topRatedMovies = useMemo(() => {
    return movies
      .filter(movie => {
        const imdb = movie.imdbRating || 0;
        const audien = movie.averageRating || 0;
        return imdb > 8 || audien >= 4;
      })
      .sort((a, b) => {
        const aScore = (a.imdbRating || 0) + (a.averageRating || 0);
        const bScore = (b.imdbRating || 0) + (b.averageRating || 0);
        return bScore - aScore; // Sort by combined score descending
      });
  }, [movies]);

  return (
    <main className="audien-dashboard min-h-screen overflow-hidden">
      <section className="audien-hero px-5 py-16 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-600">The Best of the Best</p>
          <h1 className="audien-hero-title mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Top Rated <span>Masterpieces.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Discover critically acclaimed and audience-loved movies with IMDb ratings above 8.0 and AudienSense ratings of 4.0 or higher.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        {loading && <div className="audien-panel rounded-2xl p-12 text-center text-sm font-semibold text-slate-500">Loading top rated movies...</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">{error}</div>}
        
        {!loading && !error && (
          <section>
            <div className="mb-6">
              <h2 className="audien-section-title text-3xl font-black">
                Highly Rated Selection
              </h2>
            </div>

            {topRatedMovies.length === 0 ? (
              <div className="audien-empty rounded-2xl p-10 text-center">
                No movies currently meet the high rating criteria. Check back later as more reviews come in!
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {topRatedMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onSelect={id => navigate(`/movies/${id}`)} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
