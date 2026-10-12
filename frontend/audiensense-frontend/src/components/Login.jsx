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
      <section className="audien-panel w-full max-w-md rounded-3xl p-7 sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Sign in to AudienSense</h1>
          <p className="mt-2 text-sm text-slate-500">Continue discovering your next favorite movie.</p>
        </div>
        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Username
            <input name="username" value={credentials.username} onChange={handleChange} required disabled={isSubmitting} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input type="password" name="password" value={credentials.password} onChange={handleChange} required disabled={isSubmitting} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
          </label>
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-75">
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Signing In (connecting)...</span>
              </>
            ) : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">New to AudienSense? <a href="/register" className="font-bold text-blue-600 hover:text-blue-700">Create an account</a></p>
      </section>
    </main>
  );
}
