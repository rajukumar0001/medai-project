import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Link may be expired.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)', padding:'24px' }}>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:420 }}>
        <div className="glass-card" style={{ padding:40 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>Set New Password</h1>
          <p style={{ color:'var(--text-secondary)', marginBottom:28, fontSize:'0.9rem' }}>Enter your new password below.</p>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="input-group">
              <label className="input-label">New Password</label>
              <div style={{ position:'relative' }}>
                <FiLock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input type={showPwd?'text':'password'} required className="input-field" style={{ paddingLeft:42, paddingRight:42 }}
                  placeholder="Min 6 chars" value={password} onChange={e => setPassword(e.target.value)}/>
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer'
                }}>{showPwd ? <FiEyeOff size={16}/> : <FiEye size={16}/>}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ height:48 }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'var(--text-secondary)' }}>
            <Link to="/login" style={{ color:'var(--accent-indigo)', textDecoration:'none' }}>Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default ResetPassword;
