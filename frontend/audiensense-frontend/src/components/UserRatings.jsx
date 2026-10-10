import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function UserRatings() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/reviews/user')
      .then(response => {
        if (active) {
          setReviews(response.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError('Failed to load your ratings.');
          setLoading(false);
          console.error(err);
        }
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-[calc(100vh-73px)] p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Your Ratings & Reviews</h1>
          <p className="text-slate-400 mt-2 text-sm">A complete log of every movie you've rated.</p>
        </header>

        {loading && <p className="text-slate-500">Loading your reviews...</p>}
        {error && <p className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
        
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-slate-400 font-semibold mb-6">You haven't rated any movies yet.</p>
            <Link to="/movies" className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/20">
              Explore Movies
            </Link>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-5 hover:border-slate-700 transition-colors">
                <Link to={`/movies/${review.movieId}`} className="shrink-0">
                  <img 
                    src={review.moviePosterUrl || 'https://placehold.co/100x150/1e293b/38bdf8?text=Poster'} 
                    alt={review.movieTitle} 
                    className="w-20 h-28 object-cover rounded-lg shadow-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <Link to={`/movies/${review.movieId}`} className="block w-fit hover:opacity-80 transition-opacity">
                    <h2 className="text-lg font-bold text-white truncate">{review.movieTitle}</h2>
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-amber-400">{review.rating} / 5</span>
                    <span className="text-xs text-slate-500 ml-2">&bull; {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 italic">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
