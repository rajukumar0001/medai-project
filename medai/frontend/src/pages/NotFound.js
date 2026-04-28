import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
    <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5 }}>
      <motion.div animate={{ y:[0,-12,0] }} transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }}
        style={{ fontSize:'6rem', marginBottom:20 }}>🤖</motion.div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'5rem', fontWeight:900,
        background:'var(--gradient-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>404</h1>
      <h2 style={{ fontFamily:'var(--font-display)', marginBottom:12 }}>Page Not Found</h2>
      <p style={{ color:'var(--text-secondary)', maxWidth:360, margin:'0 auto 32px', fontSize:'0.95rem' }}>
        The page you're looking for doesn't exist. It may have been moved or the URL is incorrect.
      </p>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
        <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
      </div>
    </motion.div>
  </div>
);
export default NotFound;
