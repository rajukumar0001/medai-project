import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading MedAI...' }) => (
  <div style={{
    minHeight:'100vh',display:'flex',flexDirection:'column',
    alignItems:'center',justifyContent:'center',
    background:'var(--bg-primary)',gap:'24px'
  }}>
    <motion.div
      animate={{ rotate:360 }}
      transition={{ duration:1, repeat:Infinity, ease:'linear' }}
      style={{
        width:56,height:56,borderRadius:'50%',
        border:'3px solid rgba(99,102,241,0.2)',
        borderTopColor:'var(--accent-indigo)'
      }}
    />
    <motion.p
      animate={{ opacity:[0.5,1,0.5] }}
      transition={{ duration:2, repeat:Infinity }}
      style={{ color:'var(--text-secondary)', fontFamily:'var(--font-display)', fontSize:'1rem' }}
    >
      {message}
    </motion.p>
  </div>
);

export default LoadingScreen;
