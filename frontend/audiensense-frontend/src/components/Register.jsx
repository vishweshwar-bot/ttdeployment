import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [user, setUser] = useState({ username: '', password: '', email: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    api.post('/auth/register', user)
      .then(response => {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch(err => {
        let msg = 'Registration failed. Username might be taken.';
        if (err.response?.data) {
          if (typeof err.response.data === 'string') msg = err.response.data;
          else if (err.response.data.message) msg = err.response.data.message;
          else if (err.response.data.errors) msg = 'Password must be at least 8 characters.';
        }
        setError(msg);
        console.error(err);
      });
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <section className="audien-panel w-full max-w-md rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80">
        <div className="mb-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Join the audience</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Rate, review, and track the films you watch.</p>
        </div>
        {message && <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}
        {error && <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            Username
            <input name="username" value={user.username} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 placeholder:text-slate-500" placeholder="Choose a username" />
          </label>
          <label className="block text-sm font-semibold text-slate-300">
            Email
            <input type="email" name="email" value={user.email} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 placeholder:text-slate-500" placeholder="you@domain.com" />
          </label>
          <label className="block text-sm font-semibold text-slate-300">
            Password
            <input type="password" name="password" value={user.password} onChange={handleChange} required minLength="8" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 placeholder:text-slate-500" placeholder="At least 8 characters" />
          </label>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99]">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <a href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition">Sign in</a></p>
      </section>
    </main>
  );
}
