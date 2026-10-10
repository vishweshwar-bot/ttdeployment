import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import MovieDashboard from './components/MovieDashboard';
import Login from './components/Login';
import Register from './components/Register';
import MovieDetail from './components/MovieDetail';
import TvShowDashboard from './components/TvShowDashboard';
import TvShowDetail from './components/TvShowDetail';
import Watchlist from './components/Watchlist';
import UserRatings from './components/UserRatings';
import AdminDashboard from './components/AdminDashboard';
import Chatbot from './components/Chatbot';
import TopRated from './components/TopRated';

function App() {
  return (
    <Router>
      <div className="audien-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/movies" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies" element={<MovieDashboard />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/tv-shows" element={<TvShowDashboard />} />
          <Route path="/tv-shows/:id" element={<TvShowDetail />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/ratings" element={<UserRatings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/top-rated" element={<TopRated />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
