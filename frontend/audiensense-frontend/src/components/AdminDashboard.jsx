import { useEffect, useState } from 'react';
import api from '../api';

const emptyMovie = {
  title: '',
  genre: '',
  releaseDate: '',
  boxOfficeMetrics: '',
  posterUrl: '',
  leadActors: '',
  director: '',
  verdict: '',
  seasonsEpisodes: ''
};

function hasSystemAdminRole() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'SYSTEM_ADMIN';
  } catch {
    return false;
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ users: 0 });
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasSystemAdminRole()) {
      setError('Access denied. Only SYSTEM_ADMIN users can access this dashboard.');
      return;
    }

    Promise.all([
      api.get('/admin/metrics/users'),
      api.get('/admin/movies'),
      api.get('/admin/users'),
      api.get('/admin/reviews')
    ]).then(([usersResponse, moviesResponse, userListResponse, reviewListResponse]) => {
      setMetrics({ users: usersResponse.data });
      setMovies(moviesResponse.data);
      setReviews(reviewListResponse.data);
    }).catch((requestError) => {
      setError(requestError.response?.status === 403
        ? 'Access denied. Only SYSTEM_ADMIN users can access this dashboard.'
        : 'Unable to load admin data.');
    });
  }, []);

  const saveMovie = async (event) => {
    event.preventDefault();
    const payload = editingMovie || emptyMovie;
    try {
      const response = editingMovie
        ? await api.put(`/admin/movies/${editingMovie.id}`, payload)
        : await api.post('/admin/movies', payload);
      setMovies(current => editingMovie
        ? current.map(movie => movie.id === response.data.id ? response.data : movie)
        : [response.data, ...current]);
      setEditingMovie(null);
      setMessage(editingMovie ? 'Movie updated.' : 'Movie created.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save movie.');
    }
  };

  const deleteMovie = async (id) => {
    try {
      await api.delete(`/admin/movies/${id}`);
      setMovies(current => current.filter(movie => movie.id !== id));
      setMessage('Movie deleted.');
    } catch (requestError) {
      setError('Unable to delete movie.');
    }
  };

  const deleteReview = async (id) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(current => current.filter(review => review.id !== id));
      setMessage('Review removed from moderation queue.');
    } catch (requestError) {
      setError('Unable to delete review.');
    }
  };

  const startEditing = (movie) => {
    setEditingMovie({ ...movie });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => setEditingMovie(null);

  return (
    <main className="min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8"><p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.3em]">Operations center</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Admin Dashboard</h1><p className="mt-2 text-slate-500">Manage catalog content, users, and community reviews.</p></div>
        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Registered users" value={metrics.users.toLocaleString()} accent="blue" />
          <MetricCard label="Movies managed" value={movies.length.toLocaleString()} accent="violet" />
          <MetricCard label="Reviews pending" value={reviews.length.toLocaleString()} accent="amber" />
        </div>
        <section className="audien-panel mb-8 rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-slate-900">Movie Catalog</h2><p className="mt-1 text-sm text-slate-500">Edit or remove public movie records.</p></div><button type="button" onClick={() => setEditingMovie({ ...emptyMovie })} className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white transition hover:bg-blue-700">Add Movie</button></div>
          <form onSubmit={saveMovie} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-5">
            <Input label="Title" value={editingMovie?.title || ''} onChange={value => setEditingMovie(current => ({ ...current, title: value }))} />
            <Input label="Genre" value={editingMovie?.genre || ''} onChange={value => setEditingMovie(current => ({ ...current, genre: value }))} />
            <Input label="Release date" type="date" value={editingMovie?.releaseDate || ''} onChange={value => setEditingMovie(current => ({ ...current, releaseDate: value }))} required={false} />
            <Input label="Box office" value={editingMovie?.boxOfficeMetrics || ''} onChange={value => setEditingMovie(current => ({ ...current, boxOfficeMetrics: value }))} />
            <Input label="Poster URL" value={editingMovie?.posterUrl || ''} onChange={value => setEditingMovie(current => ({ ...current, posterUrl: value }))} />
            <Input label="Lead Actors" value={editingMovie?.leadActors || ''} onChange={value => setEditingMovie(current => ({ ...current, leadActors: value }))} required={false} />
            <Input label="Director" value={editingMovie?.director || ''} onChange={value => setEditingMovie(current => ({ ...current, director: value }))} required={false} />
            <Input label="Verdict" value={editingMovie?.verdict || ''} onChange={value => setEditingMovie(current => ({ ...current, verdict: value }))} required={false} />
            <Input label="Seasons/Episodes" value={editingMovie?.seasonsEpisodes || ''} onChange={value => setEditingMovie(current => ({ ...current, seasonsEpisodes: value }))} required={false} />
            <div className="flex gap-2 md:col-span-2 lg:col-span-5"><button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-700">Save Movie</button>{editingMovie && <button type="button" onClick={cancelEditing} className="audien-button rounded-xl px-4 py-2.5 font-bold">Cancel</button>}</div>
          </form>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3">Movie</th><th>Genre</th><th>Released</th><th>Box office</th><th className="text-right">Actions</th></tr></thead><tbody>{movies.map(movie => <tr key={movie.id} className="border-b border-slate-100 last:border-0"><td className="py-3 font-bold text-slate-900"><span className="block max-w-xs truncate">{movie.title}</span></td><td className="text-slate-500">{movie.genre}</td><td className="text-slate-500">{movie.releaseDate}</td><td className="text-slate-500">{movie.boxOfficeMetrics}</td><td className="text-right"><button type="button" onClick={() => startEditing(movie)} className="mr-2 rounded-lg border border-blue-200 px-3 py-1.5 font-bold text-blue-600 hover:bg-blue-50">Edit</button><button type="button" onClick={() => deleteMovie(movie.id)} className="rounded-lg border border-red-200 px-3 py-1.5 font-bold text-red-600 hover:bg-red-50">Delete</button></td></tr>)}</tbody></table></div>
        </section>
        <section className="audien-panel rounded-2xl p-5 sm:p-6"><h2 className="text-xl font-black text-slate-900">Moderation Panel</h2><p className="mt-1 mb-5 text-sm text-slate-500">Delete inappropriate reviews from the public catalog.</p><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3">User</th><th>Movie</th><th>Rating</th><th>Review</th><th className="text-right">Action</th></tr></thead><tbody>{reviews.map(review => <tr key={review.id} className="border-b border-slate-100 last:border-0"><td className="py-3 font-bold text-slate-900">{review.username}</td><td className="text-slate-500">{review.movieTitle}</td><td className="font-bold text-amber-600">{review.rating}/5</td><td className="max-w-xl truncate text-slate-500">{review.comment}</td><td className="text-right"><button type="button" onClick={() => deleteReview(review.id)} className="rounded-lg border border-red-200 px-3 py-1.5 font-bold text-red-600 hover:bg-red-50">Delete</button></td></tr>)}</tbody></table></div></section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, accent }) {
  const colors = { blue: 'from-blue-50 to-blue-100', violet: 'from-violet-50 to-violet-100', amber: 'from-amber-50 to-orange-100' };
  const textColors = { blue: 'text-blue-700', violet: 'text-violet-700', amber: 'text-amber-700' };
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${colors[accent]} p-5 shadow-sm`}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${textColors[accent]}`}>{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = true }) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
      {label}
      <input type={type} value={value} onChange={event => onChange(event.target.value)} required={required} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
    </label>
  );
}
