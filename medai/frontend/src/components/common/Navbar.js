import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/predict', label: 'Predict' },
        { to: '/upload', label: 'Upload Report' },
        { to: '/chatbot', label: 'AI Chat' },
        { to: '/history', label: 'History' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/contact', label: 'Contact' },
      ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#00e5ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif'
          }}>M</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg,#6366f1,#00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MedAI
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hide-mobile">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
              color: location.pathname === l.to ? '#00e5ff' : '#94a3b8',
              background: location.pathname === l.to ? 'rgba(0,229,255,0.08)' : 'transparent',
              transition: 'all 0.2s',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 500 }} className="hide-mobile">{user?.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(o => !o)} className="show-mobile" style={{ background: 'none', border: 'none', color: '#f1f5f9', fontSize: 22, cursor: 'pointer' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,10,20,0.98)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{ padding: '10px 14px', borderRadius: 8, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{l.label}</Link>
            ))}
            {!isAuthenticated && <><Link to="/login" onClick={() => setMenuOpen(false)} style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.9rem' }}>Login</Link><Link to="/register" onClick={() => setMenuOpen(false)} style={{ padding: '10px 14px', color: '#00e5ff', fontSize: '0.9rem', fontWeight: 600 }}>Sign Up</Link></>}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
