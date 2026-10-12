import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    api.post('/auth/login', credentials)
      .then(response => {
        // Save the JWT token to local storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', credentials.username);
        
        // Dispatch storage event so Navbar updates immediately
        window.dispatchEvent(new Event('storage'));
        
        // Redirect to the movie dashboard
        navigate('/movies');
      })
      .catch(err => {
        const errorMsg = err.response?.data?.message || err.response?.data || 'Invalid username or password';
        setError(typeof errorMsg === 'string' ? errorMsg : 'Invalid username or password');
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <section className="audien-panel w-full max-w-md rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80">
        <div className="mb-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Sign in to AudienSense</h1>
          <p className="mt-2 text-sm text-slate-400">Continue discovering your next favorite movie.</p>
        </div>
        {error && <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            Username
            <input name="username" value={credentials.username} onChange={handleChange} required disabled={isSubmitting} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 placeholder:text-slate-500" placeholder="Enter username" />
          </label>
          <label className="block text-sm font-semibold text-slate-300">
            Password
            <input type="password" name="password" value={credentials.password} onChange={handleChange} required disabled={isSubmitting} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 placeholder:text-slate-500" placeholder="••••••••" />
          </label>
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-75">
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Signing In...</span>
              </>
            ) : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">New to AudienSense? <a href="/register" className="font-bold text-blue-400 hover:text-blue-300 transition">Create an account</a></p>
      </section>
    </main>
  );
}
