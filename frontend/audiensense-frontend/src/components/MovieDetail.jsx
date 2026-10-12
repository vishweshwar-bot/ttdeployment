import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

function StarRating({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  const ratingLabels = {
    1: 'Poor (1/5)',
    2: 'Fair (2/5)',
    3: 'Good (3/5)',
    4: 'Very Good (4/5)',
    5: 'Masterpiece (5/5)'
  };

  const currentDisplay = hoverValue || value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= currentDisplay;

          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              onClick={() => onChange(star)}
              className="p-1 text-3xl sm:text-4xl transition-transform duration-150 hover:scale-125 focus:outline-none"
              aria-label={`Rate ${star} out of 5`}
            >
              <span className={isActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-slate-700'}>
                ★
              </span>
            </button>
          );
        })}
      </div>
      <span className="text-xs font-bold text-amber-400">
        {ratingLabels[currentDisplay] || 'Click to select rating'}
      </span>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-base font-bold text-white truncate">{value}</p>
    </div>
  );
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [watchlistMsg, setWatchlistMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const reviewsSectionRef = useRef(null);

  const token = localStorage.getItem('token');
  const loggedInUsername = localStorage.getItem('username');

  // Load movie and reviews
  useEffect(() => {
    let active = true;

    api.get(`/movies/${id}`)
      .then(response => {
        if (active) setMovie(response.data);
      })
      .catch(err => console.error('Error fetching movie:', err));

    api.get(`/reviews/movie/${id}`)
      .then(response => {
        if (active) {
          const list = Array.isArray(response.data) ? response.data : [];
          setReviews(list);
        }
      })
      .catch(err => console.error('Error fetching reviews:', err));

    return () => { active = false; };
  }, [id]);

  // Compute live average rating and breakdown dynamically from all reviews
  const { liveAverage, liveCount, starBreakdown } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      const fallbackAvg = movie?.averageRating ? Number(movie.averageRating).toFixed(1) : '0.0';
      const fallbackCount = movie?.reviewCount || 0;
      return {
        liveAverage: fallbackAvg,
        liveCount: fallbackCount,
        starBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const avg = (total / reviews.length).toFixed(1);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    return {
      liveAverage: avg,
      liveCount: reviews.length,
      starBreakdown: breakdown
    };
  }, [reviews, movie]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token) {
      setError('You must be logged in to submit a review.');
      return;
    }

    if (!newReview.rating || newReview.rating < 1 || newReview.rating > 5) {
      setError('Please select a valid rating from 1 to 5 stars.');
      return;
    }

    setIsSubmitting(true);

    const reviewPayload = {
      movieId: parseInt(id, 10),
      rating: Number(newReview.rating),
      comment: newReview.comment.trim()
    };

    api.post('/reviews', reviewPayload, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        // Prepend the new review immediately to the top of the list!
        const createdReview = {
          ...response.data,
          username: response.data.username || loggedInUsername || 'You',
          createdAt: response.data.createdAt || new Date().toISOString()
        };

        setReviews(prev => [createdReview, ...prev]);
        setNewReview({ rating: 5, comment: '' });
        setSuccessMsg('Thank you! Your review has been posted successfully.');
        setIsSubmitting(false);

        // Also refresh movie metadata in background
        api.get(`/movies/${id}`)
          .then(res => setMovie(res.data))
          .catch(e => console.warn(e));
      })
      .catch(err => {
        setIsSubmitting(false);
        const msg = err.response?.data?.message || err.response?.data || 'Failed to post review. Please try again.';
        setError(typeof msg === 'string' ? msg : 'Failed to post review. Please try again.');
        console.error(err);
      });
  };

  const handleAddToWatchlist = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    api.post(`/watchlist/movie/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setWatchlistMsg('Movie added to your Watchlist!');
        setTimeout(() => setWatchlistMsg(''), 3500);
      })
      .catch(() => {
        setWatchlistMsg('This movie is already in your Watchlist.');
        setTimeout(() => setWatchlistMsg(''), 3500);
      });
  };

  const handleSyncImdb = () => {
    setIsSyncing(true);
    setSyncMsg('');
    api.post(`/movies/sync-imdb/${id}`)
      .then((res) => {
        setMovie(res.data);
        setSyncMsg('✓ Updated with official IMDb poster and metadata!');
        setTimeout(() => setSyncMsg(''), 4500);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.response?.data?.message || 'Sync failed. Set IMDB_API_KEY in backend.';
        setSyncMsg(msg);
        setTimeout(() => setSyncMsg(''), 5500);
      })
      .finally(() => setIsSyncing(false));
  };

  if (!movie) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4">
        <div className="audien-panel rounded-3xl p-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-base font-semibold text-slate-300">Loading movie details & community reviews...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      
      {/* Cinematic Backdrop Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        {/* Ambient Movie Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-[#06080e]/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/movies')} 
            className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white hover:border-white/20"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Catalog</span>
          </button>

          <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start">
            
            {/* Poster Card */}
            <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-white/15 bg-slate-900 shadow-2xl shadow-blue-500/20">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-[460px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x600/0f172a/38bdf8?text=Poster';
                }}
              />
              {movie.ottPlatform && (
                <div className="absolute top-3 right-3 rounded-full bg-slate-950/90 border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 backdrop-blur-md shadow-lg">
                  {movie.ottPlatform}
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="space-y-6">
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-blue-600/30 border border-blue-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
                    {movie.genre || 'Action / Drama'}
                  </span>
                  {movie.verdict && (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                      {movie.verdict}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-400">
                    {movie.releaseDate || 'TBA'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  {movie.title}
                </h1>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a 
                  href={`https://duckduckgo.com/?q=!ducky+site%3Ayoutube.com+${encodeURIComponent(movie.title + ' official trailer')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  <span>Play Trailer</span>
                </a>

                <button 
                  onClick={handleAddToWatchlist}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span>+ Watchlist</span>
                </button>

                <button
                  onClick={() => reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/30 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-600/30"
                >
                  <span>★ Write Review ({liveCount})</span>
                </button>

                <button
                  onClick={handleSyncImdb}
                  disabled={isSyncing}
                  className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 font-semibold text-amber-300 backdrop-blur-md transition hover:bg-amber-500/20 hover:border-amber-400/50 active:scale-95 disabled:opacity-60"
                  title="Automatically fetch official IMDb poster, rating, and cast"
                >
                  {isSyncing ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></span>
                      <span>Syncing IMDb...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Sync IMDb</span>
                    </>
                  )}
                </button>

                {watchlistMsg && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                    ✓ {watchlistMsg}
                  </span>
                )}

                {syncMsg && (
                  <span className={`text-xs font-bold px-3 py-2 rounded-xl border ${
                    syncMsg.startsWith('✓') 
                      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' 
                      : 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    {syncMsg}
                  </span>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-2">
                <MetricCard icon="⭐" label="IMDb Rating" value={movie.imdbRating ? `${Number(movie.imdbRating).toFixed(1)} / 10` : 'TBA'} />
                <MetricCard icon="👥" label="Audience Rating" value={liveCount > 0 ? `${liveAverage} / 5.0 (${liveCount})` : 'Be the first to rate'} />
                <MetricCard icon="💰" label="Box Office" value={movie.boxOfficeMetrics || 'TBA'} />
                <MetricCard icon="🎬" label="Director" value={movie.director} />
                <MetricCard icon="🎭" label="Lead Cast" value={movie.leadActors} />
                <MetricCard icon="📺" label="Streaming On" value={movie.ottPlatform} />
              </div>

              {/* Synopsis Box */}
              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Storyline Synopsis</h3>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-300">
                  {movie.description || 'Description is being curated for this title.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Ratings & Community Reviews Section */}
      <section ref={reviewsSectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] items-start">
          
          {/* Left: Audience Rating Statistics Card */}
          <div className="audien-panel rounded-3xl p-6 sm:p-7 space-y-6 sticky top-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Community Score</p>
              <h2 className="mt-1 text-2xl font-black text-white">Audience Rating</h2>
            </div>

            {/* Score Big Display */}
            <div className="flex items-center gap-4 bg-slate-950/60 border border-white/5 rounded-2xl p-5">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                  {liveAverage}
                </span>
                <span className="text-sm text-slate-500 font-bold block">out of 5</span>
              </div>
              
              <div className="border-l border-white/10 pl-4 space-y-1">
                <div className="flex text-amber-400 text-lg">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>
                      {star <= Math.round(Number(liveAverage)) ? '★' : <span className="text-slate-700">★</span>}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  Based on <strong className="text-white">{liveCount}</strong> verified audience {liveCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rating Breakdown</p>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = starBreakdown[stars] || 0;
                const percentage = liveCount > 0 ? Math.round((count / liveCount) * 100) : 0;

                return (
                  <div key={stars} className="flex items-center gap-2.5 text-xs text-slate-400">
                    <span className="w-7 font-bold text-slate-300">{stars} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-400 font-semibold">{percentage}%</span>
                  </div>
                );
              })}
            </div>

            {/* Post Review Form / Login Prompt */}
            <div className="border-t border-white/10 pt-6">
              {token ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>★</span> Leave Your Review
                  </h3>
                  
                  {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
                  {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{successMsg}</p>}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Rating (1 to 5 Stars)
                    </label>
                    <StarRating value={newReview.rating} onChange={rating => setNewReview(prev => ({ ...prev, rating }))} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Thoughts / Review (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={newReview.comment}
                      onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="What did you think of the story, performances, and direction?"
                      className="audien-search w-full rounded-xl px-4 py-3 text-xs outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-95 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Posting Review...</span>
                      </>
                    ) : (
                      'Post Audience Review'
                    )}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-center space-y-3">
                  <p className="text-xs font-bold text-blue-300">Have you watched this movie?</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sign in to share your star rating and review with other users.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
                  >
                    Sign In to Rate & Review
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right: All Community Reviews Wall */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Live Feedback</p>
                <h2 className="text-2xl font-black text-white">All Audience Reviews ({liveCount})</h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Updated in Real Time
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="audien-panel rounded-3xl p-12 text-center space-y-3">
                <div className="text-4xl">🍿</div>
                <h3 className="text-lg font-bold text-white">No audience reviews yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Be the very first viewer to post a review and help other movie buffs discover this title!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const initial = review.username ? review.username.charAt(0).toUpperCase() : 'U';

                  return (
                    <article 
                      key={review.id} 
                      className="audien-panel rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-blue-500/30"
                    >
                      {/* Review Header: User avatar, name, rating, date */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-600/30">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">
                                {review.username || 'Movie Buff'}
                              </h4>
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                                Verified Audience
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                            </span>
                          </div>
                        </div>

                        {/* Stars Pill */}
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1">
                          <span className="text-amber-400 text-sm">★</span>
                          <span className="font-black text-amber-400 text-xs">{review.rating} / 5</span>
                        </div>
                      </div>

                      {/* Review Comment */}
                      {review.comment && review.comment.trim() !== '' ? (
                        <p className="mt-4 text-sm leading-relaxed text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          "{review.comment}"
                        </p>
                      ) : (
                        <p className="mt-3 text-xs italic text-slate-500">
                          (Rated {review.rating} out of 5 stars without comment)
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </section>

    </main>
  );
}
