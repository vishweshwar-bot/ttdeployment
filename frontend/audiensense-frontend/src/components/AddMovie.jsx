import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AddMovie() {
  const [movie, setMovie] = useState({
    title: '',
    genre: '',
    releaseDate: '',
    boxOfficeMetrics: '',
    posterUrl: '',
    leadActors: '',
    director: '',
    verdict: '',
    seasonsEpisodes: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    api.post('/movies', movie)
      .then(() => {
        setIsError(false);
        setMessage('Movie added successfully! Redirecting...');
        setTimeout(() => navigate('/movies'), 2000);
      })
      .catch(error => {
        setIsError(true);
        // Specifically catch the 403 Forbidden error if a standard user tries to add a movie
        if (error.response && error.response.status === 403) {
          setMessage('Access Denied: Only System Admins can add new movies.');
        } else {
          setMessage('Failed to add movie. Please try again.');
        }
        console.error(error);
      });
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <section className="audien-panel w-full max-w-xl rounded-3xl p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Catalog manager</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Add New Movie</h1>
        {message && <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${isError ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Movie Title<input type="text" name="title" value={movie.title} onChange={handleChange} placeholder="e.g., Mirai" required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
          <label className="block text-sm font-bold text-slate-700">Genre<input type="text" name="genre" value={movie.genre} onChange={handleChange} placeholder="e.g., Action/Fantasy" required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-slate-700">Release Date<input type="date" name="releaseDate" value={movie.releaseDate} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><label className="block text-sm font-bold text-slate-700">Box Office Metrics<input type="text" name="boxOfficeMetrics" value={movie.boxOfficeMetrics} onChange={handleChange} placeholder="e.g., ₹100 Crore" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label></div>
          <label className="block text-sm font-bold text-slate-700">Poster Image URL<input type="url" name="posterUrl" value={movie.posterUrl} onChange={handleChange} placeholder="https://images.unsplash.com/... or TMDB poster URL" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-slate-700">Lead Actors<input type="text" name="leadActors" value={movie.leadActors} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><label className="block text-sm font-bold text-slate-700">Director<input type="text" name="director" value={movie.director} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-slate-700">Verdict<input type="text" name="verdict" value={movie.verdict} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><label className="block text-sm font-bold text-slate-700">Seasons/Episodes<input type="text" name="seasonsEpisodes" value={movie.seasonsEpisodes} onChange={handleChange} placeholder="For TV shows only" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label></div>
          <button type="submit" className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Save Movie</button>
        </form>
      </section>
    </main>
  );
}
