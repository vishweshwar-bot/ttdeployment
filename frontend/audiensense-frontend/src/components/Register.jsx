import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    axios.post('http://localhost:8080/api/auth/register', user)
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
      <section className="audien-panel w-full max-w-md rounded-3xl p-7 sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Join the audience</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Create your account</h1>
        </div>
        {message && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Username<input name="username" value={user.username} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
          <label className="block text-sm font-semibold text-slate-700">Email<input type="email" name="email" value={user.email} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
          <label className="block text-sm font-semibold text-slate-700">Password<input type="password" name="password" value={user.password} onChange={handleChange} required minLength="8" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
          <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <a href="/login" className="font-bold text-blue-600 hover:text-blue-700">Sign in</a></p>
      </section>
    </main>
  );
}
