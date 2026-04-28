import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import PageLayout from '../components/common/PageLayout';
import StatCard from '../components/common/StatCard';
import RiskBadge from '../components/common/RiskBadge';
import { useAuth } from '../context/AuthContext';
import { getDashboardAnalytics } from '../api/analytics';
import { DISEASE_ICONS, DISEASE_LABELS, formatDateTime } from '../utils/helpers';

const RISK_COLORS = { Low:'#10b981', Moderate:'#f59e0b', High:'#f43f5e', Critical:'#ef4444' };

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const healthScore = user?.healthScore ?? 72;
  const scoreData = [{ name:'Health', value: healthScore, fill: healthScore>70?'#10b981':healthScore>40?'#f59e0b':'#f43f5e' }];

  return (
    <PageLayout>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        style={{ marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>
            Good {new Date().getHours()<12?'Morning':'Afternoon'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Here's your health overview for today</p>
        </div>
        <Link to="/predict" className="btn btn-primary">+ New Prediction</Link>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        <StatCard icon="💊" label="Total Predictions" value={data?.totalPredictions ?? 0} color="var(--accent-indigo)" delay={0} />
        <StatCard icon="📄" label="Reports Analyzed" value={data?.totalReports ?? 0} color="var(--accent-cyan)" delay={0.1} />
        <StatCard icon="❤️" label="Health Score" value={`${healthScore}/100`} color={healthScore>70?'#10b981':healthScore>40?'#f59e0b':'#f43f5e'} delay={0.2} />
        <StatCard icon="⚠️" label="Active Risks" value={data?.riskDistribution?.filter(r=>['High','Critical'].includes(r._id)).reduce((s,r)=>s+r.count,0) ?? 0} color="var(--accent-rose)" delay={0.3} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }}>
        {/* Health Score Gauge */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="glass-card" style={{ padding:28, textAlign:'center' }}>
          <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16 }}>Overall Health Score</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={scoreData}>
              <RadialBar dataKey="value" max={100} cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ marginTop:-20 }}>
            <div style={{ fontSize:'2.8rem', fontWeight:800, fontFamily:'var(--font-display)', color: scoreData[0].fill }}>{healthScore}</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>out of 100</div>
          </div>
        </motion.div>

        {/* Risk Distribution Pie */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="glass-card" style={{ padding:28 }}>
          <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16 }}>Risk Distribution</h3>
          {data?.riskDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.riskDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({_id,count})=>`${_id}: ${count}`}>
                  {data.riskDistribution.map((entry,i) => (
                    <Cell key={i} fill={RISK_COLORS[entry._id] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--bg-secondary)', border:'1px solid var(--border-glass)', borderRadius:8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'var(--text-muted)', fontSize:'0.9rem' }}>
              No predictions yet. <Link to="/predict" style={{ marginLeft:6, color:'var(--accent-cyan)' }}>Start now →</Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Predictions */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
        className="glass-card" style={{ padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontFamily:'var(--font-display)' }}>Recent Predictions</h3>
          <Link to="/history" style={{ fontSize:'0.82rem', color:'var(--accent-cyan)' }}>View all →</Link>
        </div>
        {data?.recentPredictions?.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {data.recentPredictions.map(pred => (
              <Link key={pred._id} to={`/results/${pred._id}`}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 16px', background:'var(--bg-glass)', borderRadius:10,
                  border:'1px solid var(--border-subtle)', textDecoration:'none',
                  transition:'all 0.2s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:'1.3rem' }}>{DISEASE_ICONS[pred.diseaseType] || '🔬'}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text-primary)' }}>
                      {DISEASE_LABELS[pred.diseaseType] || pred.diseaseType}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{formatDateTime(pred.createdAt)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)' }}>{pred.result.probability.toFixed(1)}%</span>
                  <RiskBadge risk={pred.result.riskLevel} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🔬</div>
            <p>No predictions yet.</p>
            <Link to="/predict" className="btn btn-primary btn-sm" style={{ marginTop:12, display:'inline-flex' }}>
              Make your first prediction →
            </Link>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid-3" style={{ marginTop:20 }}>
        {[
          { to:'/predict', icon:'🔬', label:'New Prediction', desc:'Check for 15+ diseases', color:'var(--accent-indigo)' },
          { to:'/upload', icon:'📄', label:'Upload Report', desc:'Analyze medical reports', color:'var(--accent-cyan)' },
          { to:'/chatbot', icon:'🤖', label:'AI Chatbot', desc:'Get health guidance', color:'var(--accent-emerald)' }
        ].map((item, i) => (
          <motion.div key={item.to} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5+i*0.1 }}>
            <Link to={item.to} className="glass-card" style={{
              display:'block', padding:22, textDecoration:'none', textAlign:'center'
            }}>
              <div style={{ fontSize:'2rem', marginBottom:10 }}>{item.icon}</div>
              <div style={{ fontWeight:700, fontFamily:'var(--font-display)', marginBottom:4, color:item.color }}>{item.label}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{item.desc}</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
};
export default Dashboard;
