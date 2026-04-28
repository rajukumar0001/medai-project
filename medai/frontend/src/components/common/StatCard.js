import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, label, value, color = 'var(--accent-indigo)', trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card"
    style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
      }}>{icon}</div>
      {trend !== undefined && (
        <span style={{
          fontSize: '0.78rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6,
          background: trend >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
          color: trend >= 0 ? '#10b981' : '#f43f5e'
        }}>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
      )}
    </div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  </motion.div>
);

export default StatCard;
