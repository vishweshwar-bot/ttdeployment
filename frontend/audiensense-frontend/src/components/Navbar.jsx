import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = ({ onLanguageChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Movie Buff');

  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'zh', name: '中文' }
  ];
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  // Keep auth state in sync
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUsername(localStorage.getItem('username') || 'Movie Buff');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langObj) => {
    i18n.changeLanguage(langObj.code);
    localStorage.setItem('preferredLanguage', langObj.name);
    setIsLangOpen(false);
    if (onLanguageChange) onLanguageChange(langObj.code);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setToken(null);
    setIsProfileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/movies" className="flex items-center gap-1.5 font-black text-2xl tracking-tight text-white hover:opacity-90 transition-opacity">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-extrabold text-xl">AS</span>
            <span className="text-blue-400">Audien</span>Sense
          </Link>

          <div className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <Link
              to="/movies"
              className={`transition-colors py-1 ${
                isActive('/movies') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('Movies')}
            </Link>
            <Link
              to="/tv-shows"
              className={`transition-colors py-1 ${
                isActive('/tv-shows') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('TV Shows')}
            </Link>
            <Link
              to="/top-rated"
              className={`transition-colors py-1 ${
                isActive('/top-rated') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('Top Rated')}
            </Link>
          </div>
        </div>

        {/* Right Section: Language, Watchlist, Profile / Login */}
        <div className="flex items-center gap-3">
          
          {/* IMDb-Style Watchlist Button */}
          <Link
            to="/watchlist"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
            <span className="hidden sm:inline">{t('Watchlist')}</span>
          </Link>

          {/* Preferred Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>{currentLang.name}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50">
                {languages.map((langObj) => (
                  <button
                    key={langObj.code}
                    onClick={() => handleLanguageSelect(langObj)}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      currentLang.code === langObj.code
                        ? 'bg-blue-600/20 text-blue-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {langObj.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Rendering: User Profile vs Sign In */}
          {token ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs uppercase shadow-inner">
                  {username.charAt(0)}
                </div>
                <span className="text-xs font-semibold max-w-[90px] truncate hidden sm:inline">
                  {username}
                </span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50 divide-y divide-slate-800">
                  <div className="px-4 py-3">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{username}</p>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      to="/watchlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                      </svg>
                      Your Watchlist
                    </Link>

                    <Link
                      to="/ratings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Your Ratings & Reviews
                    </Link>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30"
            >
              {t('Sign In')}
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;