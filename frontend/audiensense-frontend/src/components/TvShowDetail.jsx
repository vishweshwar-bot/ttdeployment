import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function posterUrl(title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="500" height="800" fill="url(#g)"/><circle cx="400" cy="120" r="150" fill="#8b5cf6" opacity=".22"/><text x="250" y="360" text-anchor="middle" fill="white" font-family="Arial" font-size="42" font-weight="700">${title}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function TvShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get(`/tv-shows/${id}`)
      .then(response => active && setShow(response.data))
      .catch(requestError => active && setError(requestError.response?.data?.message || 'Unable to load this TV show.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4"><div className="audien-panel rounded-2xl px-8 py-6 text-sm font-semibold text-slate-500">Loading TV show details...</div></main>;
  if (error) return <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4"><div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 text-sm font-semibold text-red-700">{error}</div></main>;
  if (!show) return null;

  return (
    <main className="min-h-[calc(100vh-73px)] px-4 py-8 sm:px-6 lg:py-10">
      <div className="audien-panel mx-auto max-w-6xl overflow-hidden rounded-3xl">
        <button onClick={() => navigate('/tv-shows')} className="ml-5 mt-5 flex items-center gap-2 text-sm font-bold text-violet-600 sm:ml-8">&larr; Back to TV Shows</button>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[340px_1fr] lg:p-10">
          <div className="overflow-hidden rounded-2xl bg-slate-100"><img src={show.posterUrl || posterUrl(show.title)} alt={`${show.title} poster`} className="h-[420px] w-full object-cover" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{show.title}</h1><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-violet-700">{show.genre || 'Series'}</span></div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2"><Metric label="Release date" value={show.releaseDate || 'TBA'} /><Metric label="Network" value={show.network || 'Details unavailable'} /><Metric label="Seasons" value={`${show.seasons || 0} season${show.seasons === 1 ? '' : 's'}`} /><Metric label="Audience score" value="Coming soon" /></div>
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-5"><h2 className="text-lg font-bold text-violet-900">Series overview</h2><p className="mt-2 text-sm leading-relaxed text-violet-800">Discover the story, cast, episodes, and audience response for this series through AudienSense analytics.</p></div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <a 
                href={`https://duckduckgo.com/?q=!ducky+site%3Ayoutube.com+${encodeURIComponent(show.title + ' official trailer')}`}
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
      </div>
    </main>
  );
}

function Metric({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="mt-2 text-lg font-bold text-slate-900">{value}</p></div>; }
