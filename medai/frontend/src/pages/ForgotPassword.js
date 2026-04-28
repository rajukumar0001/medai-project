import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-primary)', padding:'24px'
    }}>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:420 }}>
        <div className="glass-card" style={{ padding:40 }}>
          <Link to="/login" style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-secondary)', textDecoration:'none', marginBottom:24, fontSize:'0.88rem' }}>
            <FiArrowLeft size={14}/> Back to Login
          </Link>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>Reset Password</h1>
          {!sent ? (
            <>
              <p style={{ color:'var(--text-secondary)', marginBottom:28, fontSize:'0.9rem' }}>
                Enter your email and we'll send a password reset link.
              </p>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div style={{ position:'relative' }}>
                    <FiMail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                    <input type="email" required className="input-field" style={{ paddingLeft:42 }}
                      placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ height:48 }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center', paddingTop:16 }}>
              <div style={{ fontSize:'3rem', marginBottom:16 }}>📧</div>
              <p style={{ color:'var(--text-secondary)', marginBottom:24 }}>
                If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
              </p>
              <Link to="/login" className="btn btn-primary">Back to Login</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPassword;
