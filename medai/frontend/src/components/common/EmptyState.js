import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon = '📭', title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
  >
    <div style={{ fontSize: '3rem' }}>{icon}</div>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
    {description && <p style={{ color: 'var(--text-secondary)', maxWidth: 340, fontSize: '0.9rem' }}>{description}</p>}
    {action}
  </motion.div>
);

export default EmptyState;
