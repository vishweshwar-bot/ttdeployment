import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverValue || value);

        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
            className="text-3xl transition-transform duration-150 hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} out of 5`}
          >
            <span className={isActive ? 'text-blue-400' : 'text-slate-600'}>★</span>
          </button>
        );
      })}
      <span className="ml-2 text-sm text-slate-300">
        {value > 0 ? `${value} / 5` : 'Select a rating'}
      </span>
    </div>
  );
}

function PosterImage({ src, alt, title }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6 text-center">
        <div>
          <div className="mb-3 text-5xl">🎬</div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Poster Unavailable</p>
          <p className="mt-3 text-sm text-slate-400">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-[420px] w-full object-cover transition duration-500 ease-out hover:scale-105"
    />
  );
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then(response => setMovie(response.data))
      .catch(err => console.error('Error fetching movie:', err));

    api.get(`/reviews/movie/${id}`)
      .then(response => setReviews(response.data))
      .catch(err => console.error('Error fetching reviews:', err));
  }, [id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to submit a review.');
      return;
    }

    const userRating = newReview.rating;
    const userComment = newReview.comment.trim();
    const reviewPayload = {
      movieId: parseInt(id, 10),
      rating: userRating,
      comment: userComment
    };

    api.post('/reviews', reviewPayload, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(response => {
        setReviews(currentReviews => [...currentReviews, response.data]);
        setNewReview({ rating: 5, comment: '' });
        setError('');
        
        // Refetch the movie to update average rating and review count
        api.get(`/movies/${id}`)
          .then(res => setMovie(res.data))
          .catch(err => console.error('Error fetching updated movie:', err));
      })
      .catch(error => {
        console.error(error);
        setError('Failed to post review. Please try again.');
      });
  };

  const handleAddToWatchlist = () => {
    api.post(`/watchlist/movie/${id}`)
      .then(() => {
        alert('Movie successfully added to your watchlist!');
      })
      .catch(err => {
        console.error('Error adding to watchlist:', err);
        alert('Failed to add movie to watchlist. It may already be added.');
      });
  };

  if (!movie) {
    return <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4"><div className="audien-panel rounded-2xl px-8 py-6 text-sm font-semibold text-slate-500">Loading movie analytics...</div></main>;
  }

  return (
    <main className="min-h-[calc(100vh-73px)] px-4 py-8 sm:px-6 lg:py-10">
      <div className="audien-panel mx-auto max-w-6xl overflow-hidden rounded-3xl">
        <button onClick={() => navigate('/movies')} className="ml-5 mt-5 flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700 sm:ml-8">
          &larr; Back to Dashboard
        </button>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[340px_1fr] lg:p-10">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <PosterImage src={movie.posterUrl} alt={`${movie.title} poster`} title={movie.title} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{movie.title}</h1>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-blue-700">{movie.genre || 'Featured'}</span>
              {movie.ottPlatform && (
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 border border-slate-700">
                  {movie.ottPlatform}
                </span>
              )}
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Metric label="Release date" value={movie.releaseDate || 'TBA'} />
              <Metric label="IMDb rating" value={movie.imdbRating ? `${Number(movie.imdbRating).toFixed(1)} / 10` : 'Not available'} />
              <Metric label="Box office" value={movie.boxOfficeMetrics || 'Data updating soon'} />
              {movie.director && <Metric label="Director" value={movie.director} />}
              {movie.leadActors && <Metric label="Lead actors" value={movie.leadActors} />}
              {movie.verdict && <Metric label="Verdict" value={movie.verdict} />}
              {movie.seasonsEpisodes && <Metric label="Seasons/Episodes" value={movie.seasonsEpisodes} />}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-bold text-slate-900">About this title</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{movie.description || 'Description is being updated for this title.'}</p>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Audience review rating</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-amber-800">Based on {movie.reviewCount || 0} reviews</p>
                <div className="flex items-center gap-1" aria-label={`${Number(movie.averageRating || 0).toFixed(1)} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map(star => <span key={star} className={star <= Math.round(Number(movie.averageRating || 0)) ? 'text-amber-400' : 'text-slate-300'}>★</span>)}
                  <span className="ml-2 text-lg font-black text-amber-700">{Number(movie.averageRating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button onClick={handleAddToWatchlist} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">+ Add to My Watchlist</button>
              <a 
                href={`https://duckduckgo.com/?q=!ducky+site%3Ayoutube.com+${encodeURIComponent(movie.title + ' official trailer')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#ff0000] px-5 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                Play Trailer
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-8 lg:p-10">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Audience reviews</h2>
          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Leave a review</h3>
            <div><label className="mb-2 block text-sm font-semibold text-slate-700">Your rating</label><StarRating value={newReview.rating} onChange={rating => setNewReview({ ...newReview, rating })} /></div>
            <label className="block text-sm font-semibold text-slate-700">Comment (Optional)<textarea rows="3" value={newReview.comment} onChange={event => setNewReview({ ...newReview, comment: event.target.value })} placeholder="What did you think of the film's performance and execution?" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700">Submit review</button>
          </form>
          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No reviews yet. Be the first to share your thoughts!</p> : reviews.map(review => (
              <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3"><span className="font-bold text-slate-900">{review.username || 'Movie Buff'}</span><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">⭐ {review.rating} / 5</span></div>
                {review.comment && review.comment.trim() !== '' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
