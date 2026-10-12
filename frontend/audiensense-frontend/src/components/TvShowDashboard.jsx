import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function posterUrl(title, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="500" height="800" fill="url(#g)"/><circle cx="400" cy="120" r="150" fill="${accent}" opacity=".22"/><text x="250" y="360" text-anchor="middle" fill="white" font-family="Arial" font-size="42" font-weight="700">${title}</text><text x="250" y="420" text-anchor="middle" fill="white" opacity=".75" font-family="Arial" font-size="18" letter-spacing="4">AUDIENSENSE</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function TvCard({ show, onSelect }) {
  return (
    <article onClick={() => onSelect(show.id)} className="audien-card group cursor-pointer overflow-hidden rounded-2xl">
      <div className="relative overflow-hidden">
        <img src={show.posterUrl || posterUrl(show.title, '#7c3aed')} alt={`${show.title} poster`} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 pt-20">
          <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{show.genre || 'Series'}</span>
        </div>
      </div>
      <div className="p-5"><h3 className="audien-card-title truncate text-lg font-bold">{show.title}</h3><div className="audien-card-meta mt-3 flex items-center justify-between text-xs"><span>{show.releaseDate || 'TBA'}</span><span>{show.seasons || 0} season{show.seasons === 1 ? '' : 's'}</span></div></div>
    </article>
  );
}

export default function TvShowDashboard() {
  const [shows, setShows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get('/tv-shows?page=0&size=24')
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : response.data.content || [];
        if (active) setShows(data);
      })
      .catch(requestError => active && setError(requestError.response?.data?.message || 'Unable to load TV shows.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filteredShows = useMemo(() => shows.filter(show => {
    const search = searchTerm.trim().toLowerCase();
    return (!search || `${show.title} ${show.genre}`.toLowerCase().includes(search)) &&
      (selectedGenre === 'All' || show.genre === selectedGenre);
  }), [shows, searchTerm, selectedGenre]);

  const genres = ['All', ...new Set(shows.map(show => show.genre).filter(Boolean))];

  return (
    <main className="audien-dashboard min-h-screen overflow-hidden">
      <section className="audien-hero px-5 py-16 sm:px-8 lg:px-12"><div className="relative mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[0.35em] text-violet-400">Series worth staying up for</p><h1 className="audien-hero-title mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl text-white">Your next obsession <span className="text-violet-400">starts here.</span></h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">Explore original series, award-winning dramas, and the latest television favorites.</p></div></section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="audien-panel mb-10 rounded-3xl p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">Find your series</p><h2 className="mt-1 text-2xl font-bold">Search the TV catalog</h2>
          <div className="relative mt-4 w-full lg:max-w-xl"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search by title or genre..." className="audien-search w-full rounded-xl px-11 py-3.5 text-sm outline-none" /></div>
          <div className="mt-4 flex flex-wrap gap-2">{genres.map(genre => <button key={genre} type="button" onClick={() => setSelectedGenre(genre)} className={`audien-genre rounded-full border px-3 py-2 text-sm font-semibold ${selectedGenre === genre ? 'audien-genre-active' : ''}`}>{genre}</button>)}</div>
        </div>
        {loading && <div className="audien-panel rounded-2xl p-12 text-center text-sm font-semibold text-slate-500">Loading your TV catalog...</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">{error}</div>}
        {!loading && !error && <section><div className="mb-6 flex items-end justify-between"><div><p className="audien-section-kicker text-xs font-bold uppercase tracking-[0.3em]">Explore the collection</p><h2 className="audien-section-title mt-2 text-3xl font-black">All TV Shows</h2></div>{(searchTerm || selectedGenre !== 'All') && <button type="button" onClick={() => { setSearchTerm(''); setSelectedGenre('All'); }} className="audien-button rounded-lg px-4 py-2 text-sm font-semibold">Clear filters</button>}</div>{filteredShows.length === 0 ? <div className="audien-empty rounded-2xl p-10 text-center">No TV shows match your search. Try another title or genre.</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredShows.map(show => <TvCard key={show.id} show={show} onSelect={id => navigate(`/tv-shows/${id}`)} />)}</div>}</section>}
      </div>
    </main>
  );
}
