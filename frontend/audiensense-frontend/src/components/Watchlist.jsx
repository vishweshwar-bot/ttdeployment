import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the authenticated user's watchlist from Spring Boot
    api.get('/watchlist')
      .then(response => {
        setWatchlist(response.data);
      })
      .catch(err => {
        console.error("Error fetching watchlist:", err);
        setError('Failed to load your watchlist. Please ensure you are logged in.');
      });
  }, []);

  const handleRemoveFromWatchlist = (id) => {
    api.delete(`/watchlist/${id}`)
      .then(() => {
        setWatchlist(watchlist.filter(item => item.id !== id));
      })
      .catch(err => {
        console.error("Error removing item:", err);
      });
  };

  return (
    <main className="min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.3em]">Your collection</p><h1 className="mt-2 text-4xl font-black tracking-tight">My Watchlist</h1></div>
          <button onClick={() => navigate('/movies')} className="audien-button rounded-xl px-4 py-2.5 text-sm font-bold">Back to Dashboard</button>
        </div>
        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {watchlist.length === 0 ? (
          <div className="audien-panel rounded-3xl p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">🎬</div>
            <h2 className="mt-4 text-xl font-black text-slate-900">Your watchlist is empty</h2>
            <p className="mt-2 text-sm text-slate-500">Save a movie and it will appear here for later viewing.</p>
            <button onClick={() => navigate('/movies')} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700">Explore movies</button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {watchlist.map(item => (
              <article key={item.id} className="audien-card flex flex-col justify-between rounded-2xl p-6">
                <div><span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Saved movie</span><h2 className="mt-2 text-2xl font-black text-slate-900">{item.title || (item.movie && item.movie.title) || 'Movie Item'}</h2><p className="mt-3 text-sm leading-relaxed text-slate-500">Added to your personal list for later viewing.</p></div>
                <button onClick={() => handleRemoveFromWatchlist(item.id)} className="mt-6 self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50">Remove from Watchlist</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
