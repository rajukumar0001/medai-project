import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/common/PageLayout';
import api from '../api/axios';
import { formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('stats');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/logs')
    ]).then(([s, u, l]) => {
      setStats(s.data); setUsers(u.data.users); setLogs(l.data.logs);
    }).catch(() => toast.error('Failed to load admin data'))
    .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      setUsers(u => u.map(user => user._id===id ? {...user, isActive:res.data.isActive} : user));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    { icon:'👥', label:'Total Users', value:stats?.totalUsers||0, color:'var(--accent-indigo)' },
    { icon:'🔬', label:'Predictions Made', value:stats?.totalPredictions||0, color:'var(--accent-cyan)' },
    { icon:'📄', label:'Reports Analyzed', value:stats?.totalReports||0, color:'var(--accent-emerald)' },
    { icon:'🆕', label:'New Users Today', value:stats?.newUsersToday||0, color:'var(--accent-amber)' },
  ];

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <span style={{ fontSize:'1.5rem' }}>⚙️</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem' }}>Admin Panel</h1>
          <span style={{ background:'rgba(244,63,94,0.15)', color:'#f43f5e', borderRadius:6, padding:'2px 10px', fontSize:'0.75rem', fontWeight:700 }}>ADMIN</span>
        </div>
        <p style={{ color:'var(--text-secondary)' }}>Platform overview, user management, and activity logs.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className="glass-card" style={{ padding:20 }}>
            <div style={{ fontSize:'1.6rem', marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:'2rem', fontWeight:800, fontFamily:'var(--font-display)', color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'var(--bg-glass)', borderRadius:10, padding:4, border:'1px solid var(--border-glass)', marginBottom:20, width:'fit-content' }}>
        {['stats','users','logs'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'7px 16px', borderRadius:7, border:'none', cursor:'pointer',
            background: tab===t ? 'var(--gradient-primary)' : 'transparent',
            color: tab===t ? '#fff' : 'var(--text-secondary)',
            fontWeight:600, fontSize:'0.85rem', fontFamily:'var(--font-body)', textTransform:'capitalize'
          }}>{t === 'stats' ? '📊 Overview' : t === 'users' ? '👥 Users' : '📝 Logs'}</button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
            <h3 style={{ fontFamily:'var(--font-display)' }}>All Users ({users.length})</h3>
            <input className="input-field" style={{ maxWidth:240, padding:'8px 14px' }}
              placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                  {['Name','Email','Role','Status','Joined','Actions'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--text-muted)', fontWeight:600, fontSize:'0.75rem', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                    <td style={{ padding:'11px 12px', fontWeight:600 }}>{u.name}</td>
                    <td style={{ padding:'11px 12px', color:'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding:'11px 12px' }}>
                      <span style={{ background:'rgba(99,102,241,0.12)', color:'var(--accent-cyan)', borderRadius:4, padding:'2px 8px', fontSize:'0.75rem' }}>{u.role}</span>
                    </td>
                    <td style={{ padding:'11px 12px' }}>
                      <span style={{ background:u.isActive?'rgba(16,185,129,0.12)':'rgba(244,63,94,0.12)',
                        color:u.isActive?'#10b981':'#f43f5e', borderRadius:4, padding:'2px 8px', fontSize:'0.75rem' }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding:'11px 12px', color:'var(--text-muted)', fontSize:'0.78rem' }}>{formatDateTime(u.createdAt)}</td>
                    <td style={{ padding:'11px 12px' }}>
                      <button className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`} onClick={() => toggleUser(u._id)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16 }}>Activity Logs</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {logs.length === 0 ? (
              <p style={{ color:'var(--text-muted)', textAlign:'center', padding:40 }}>No admin logs yet.</p>
            ) : logs.map(log => (
              <div key={log._id} style={{ display:'flex', gap:12, padding:'10px 14px', background:'var(--bg-glass)', borderRadius:8, alignItems:'flex-start' }}>
                <span style={{ fontSize:'0.8rem', color:'var(--accent-indigo)', flexShrink:0, marginTop:2 }}>⚡</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.88rem', color:'var(--text-primary)' }}>{log.action}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>
                    By {log.admin?.name || 'Admin'} • {formatDateTime(log.createdAt)}
                    {log.targetUser && ` • Target: ${log.targetUser.name}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'stats' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card" style={{ padding:28, textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>📊</div>
          <p>Switch to <strong>Users</strong> or <strong>Logs</strong> tab to view detailed information.</p>
        </motion.div>
      )}
    </PageLayout>
  );
};
export default AdminPanel;
