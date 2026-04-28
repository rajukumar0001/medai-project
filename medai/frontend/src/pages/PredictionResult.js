import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import PageLayout from '../components/common/PageLayout';
import RiskBadge from '../components/common/RiskBadge';
import LoadingScreen from '../components/common/LoadingScreen';
import { getPrediction } from '../api/predictions';
import { DISEASE_LABELS, DISEASE_ICONS, formatDateTime, getRiskColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const Section = ({ title, icon, items, color='var(--accent-indigo)' }) => (
  items?.length > 0 ? (
    <div className="glass-card" style={{ padding:22 }}>
      <h4 style={{ fontFamily:'var(--font-display)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
        <span>{icon}</span> {title}
      </h4>
      <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display:'flex', gap:10, fontSize:'0.88rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
            <span style={{ color, flexShrink:0, marginTop:2 }}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  ) : null
);

const PredictionResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrediction(id)
      .then(r => setPrediction(r.data.prediction))
      .catch(() => { toast.error('Failed to load prediction'); navigate('/history'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <LoadingScreen message="Loading results..." />;
  if (!prediction) return null;

  const { result, diseaseType, createdAt, inputData } = prediction;
  const riskColor = getRiskColor(result.riskLevel);
  const gaugeData = [{ value: result.probability, fill: riskColor }];

  const urgencyBg = {
    routine: 'rgba(16,185,129,0.1)', soon: 'rgba(245,158,11,0.1)',
    urgent: 'rgba(244,63,94,0.1)', emergency: 'rgba(239,68,68,0.15)'
  }[result.urgency] || 'rgba(99,102,241,0.1)';

  const urgencyColor = {
    routine: '#10b981', soon: '#f59e0b', urgent: '#f43f5e', emergency: '#ef4444'
  }[result.urgency] || 'var(--accent-indigo)';

  return (
    <PageLayout>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <Link to="/history" style={{ color:'var(--text-muted)', fontSize:'0.85rem', textDecoration:'none' }}>← Back to History</Link>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:'2rem' }}>{DISEASE_ICONS[diseaseType]}</span>
            {DISEASE_LABELS[diseaseType] || diseaseType}
          </h1>
          <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{formatDateTime(createdAt)}</span>
        </div>
      </motion.div>

      {/* Main Result Card */}
      <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
        className="glass-card" style={{ padding:32, marginBottom:24, textAlign:'center' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <ResponsiveContainer width={200} height={140}>
            <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={gaugeData}>
              <RadialBar dataKey="value" max={100} cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ marginTop:-20 }}>
            <div style={{ fontSize:'3.5rem', fontWeight:800, fontFamily:'var(--font-display)', color:riskColor, lineHeight:1 }}>
              {result.probability.toFixed(1)}%
            </div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:4 }}>Risk Probability</div>
          </div>
          <RiskBadge risk={result.riskLevel} />
          <div style={{
            padding:'10px 20px', borderRadius:10, background:urgencyBg,
            border:`1px solid ${urgencyColor}44`, color:urgencyColor,
            fontSize:'0.85rem', fontWeight:600
          }}>
            Urgency: {result.urgency?.charAt(0).toUpperCase() + result.urgency?.slice(1)} •{' '}
            {result.prediction ? '⚠️ Positive Risk Detected' : '✅ Low Risk'}
          </div>
        </div>
      </motion.div>

      {/* Doctor Advice */}
      {result.doctorAdvice && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="glass-card" style={{ padding:22, marginBottom:20, borderLeft:`3px solid ${urgencyColor}` }}>
          <h4 style={{ fontFamily:'var(--font-display)', marginBottom:10, display:'flex', gap:8 }}>
            <span>👨‍⚕️</span> Doctor's Advice
          </h4>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:1.7 }}>{result.doctorAdvice}</p>
          {result.specialists?.length > 0 && (
            <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Recommended specialists:</span>
              {result.specialists.map(s => (
                <span key={s} style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)',
                  borderRadius:6, padding:'2px 10px', fontSize:'0.78rem', color:'var(--accent-cyan)' }}>{s}</span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 4 info sections */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:24 }}>
        <Section title="Why This Risk?" icon="🔍" items={result.reasons} color="var(--accent-amber)" />
        <Section title="Prevention Tips" icon="🛡️" items={result.prevention} color="var(--accent-emerald)" />
        <Section title="Diet Plan" icon="🥗" items={result.dietPlan} color="var(--accent-cyan)" />
        <Section title="Exercise Tips" icon="🏃" items={result.exerciseTips} color="var(--accent-indigo)" />
      </motion.div>

      {/* Input Summary */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
        className="glass-card" style={{ padding:22 }}>
        <h4 style={{ fontFamily:'var(--font-display)', marginBottom:14 }}>📋 Input Parameters</h4>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          {Object.entries(inputData || {}).map(([key, val]) => (
            <div key={key} style={{ background:'var(--bg-glass)', borderRadius:8, padding:'8px 12px' }}>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{key.replace(/_/g,' ')}</div>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'var(--text-primary)', marginTop:2 }}>{val}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
        style={{ display:'flex', gap:12, marginTop:24, flexWrap:'wrap' }}>
        <Link to="/predict" className="btn btn-primary">🔬 New Prediction</Link>
        <Link to="/upload" className="btn btn-secondary">📄 Upload Report</Link>
        <Link to="/chatbot" className="btn btn-secondary">🤖 Ask AI Chat</Link>
        <Link to="/history" className="btn btn-secondary">📋 View History</Link>
      </motion.div>
    </PageLayout>
  );
};
export default PredictionResult;
