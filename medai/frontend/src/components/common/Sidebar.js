import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to:'/dashboard',    icon:'📊', label:'Dashboard' },
  { to:'/predict',      icon:'🔬', label:'Predict Disease' },
  { to:'/upload',       icon:'📄', label:'Upload Report' },
  { to:'/reports',      icon:'📋', label:'My Reports' },
  { to:'/history',      icon:'🕘', label:'History' },
  { to:'/chatbot',      icon:'🤖', label:'AI Chatbot' },
  { to:'/appointments', icon:'📅', label:'Appointments' },
  { to:'/profile',      icon:'👤', label:'Profile' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: 'rgba(13,21,38,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column',
      padding: '24px 12px', position: 'sticky', top: 64,
    }}>
      {/* User chip */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 10px', marginBottom:24, background:'rgba(255,255,255,0.04)', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#00e5ff)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:15 }}>
          {user?.name?.[0]?.toUpperCase()||'U'}
        </div>
        <div>
          <div style={{ fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9' }}>{user?.name?.split(' ')[0]||'User'}</div>
          <div style={{ fontSize:'0.7rem',color:'#475569' }}>{user?.role||'user'}</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
        {links.map(l => {
          const active = location.pathname === l.to || (l.to !== '/dashboard' && location.pathname.startsWith(l.to));
          return (
            <Link key={l.to} to={l.to} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:10, textDecoration:'none',
              background: active ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(0,229,255,0.08))' : 'transparent',
              border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              color: active ? '#00e5ff' : '#64748b',
              fontSize:'0.875rem', fontWeight: active ? 600 : 500,
              transition:'all 0.2s',
            }}>
              <span style={{fontSize:16}}>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link to="/admin" style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,color:location.pathname==='/admin'?'#f43f5e':'#64748b',fontSize:'0.875rem',fontWeight:500,marginTop:8,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:16 }}>
            <span style={{fontSize:16}}>🛡️</span> Admin Panel
          </Link>
        )}
      </div>

      {/* Health Score */}
      {user?.healthScore != null && (
        <div style={{ marginTop:'auto',padding:14,background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.1))',borderRadius:12,border:'1px solid rgba(16,185,129,0.2)' }}>
          <div style={{fontSize:'0.7rem',color:'#64748b',marginBottom:4}}>Health Score</div>
          <div style={{fontSize:'1.6rem',fontWeight:800,fontFamily:'Syne,sans-serif',color:user.healthScore>=70?'#10b981':user.healthScore>=40?'#f59e0b':'#f43f5e'}}>
            {user.healthScore}<span style={{fontSize:'0.9rem',color:'#475569'}}>/100</span>
          </div>
        </div>
      )}
    </aside>
  );
}
