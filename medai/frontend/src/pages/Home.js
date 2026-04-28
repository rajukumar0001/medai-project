import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';

const DISEASES = [
  { icon:'🩸', name:'Diabetes' }, { icon:'❤️', name:'Heart Disease' }, { icon:'🫀', name:'BP Risk' },
  { icon:'🫘', name:'Kidney Disease' }, { icon:'🟫', name:'Liver Disease' }, { icon:'🦋', name:'Thyroid' },
  { icon:'💉', name:'Anemia' }, { icon:'🧪', name:'Cholesterol' }, { icon:'⚖️', name:'Obesity' },
  { icon:'🧠', name:'Stroke' }, { icon:'😰', name:'Stress' }, { icon:'💙', name:'Depression' },
  { icon:'🔬', name:'PCOS' }, { icon:'🦴', name:'Arthritis' }, { icon:'💊', name:'General Health' }
];

const FEATURES = [
  { icon:'🤖', title:'AI Disease Prediction', desc:'15+ diseases predicted with scikit-learn ML models trained on medical datasets' },
  { icon:'📄', title:'PDF Report Analysis', desc:'Upload CBC, Lipid, Thyroid, LFT, KFT reports for instant AI-powered analysis' },
  { icon:'🔍', title:'Abnormal Value Detection', desc:'Automatically highlights parameters outside normal ranges with severity levels' },
  { icon:'📊', title:'Health Dashboard', desc:'Trends, charts, history and health score tracking over time' },
  { icon:'🤖', title:'AI Health Chatbot', desc:'24/7 symptom Q&A and health guidance powered by intelligent keyword AI' },
  { icon:'🔔', title:'Smart Reminders', desc:'Medication, water, and appointment reminders with email alerts' },
];

const Home = () => (
  <div style={{ minHeight: '100vh' }}>
    <Navbar />

    {/* Hero */}
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px 60px', textAlign: 'center', position: 'relative'
    }}>
      {/* Background glow */}
      <div style={{
        position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)',
        width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents:'none'
      }}/>

      <div style={{ maxWidth: 860, position: 'relative' }}>
        <motion.div
          initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)',
            borderRadius:100, padding:'6px 18px', marginBottom:28,
            fontSize:'0.82rem', color:'var(--accent-cyan)', fontWeight:500
          }}
        >
          🚀 AI-Powered Health Intelligence Platform
        </motion.div>

        <motion.h1
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.7 }}
          style={{ fontSize:'clamp(2.4rem,5vw,4rem)', fontFamily:'var(--font-display)', lineHeight:1.1, marginBottom:24 }}
        >
          Predict Health Risks with{' '}
          <span style={{ background:'var(--gradient-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Artificial Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25, duration:0.6 }}
          style={{ fontSize:'1.1rem', color:'var(--text-secondary)', maxWidth:640, margin:'0 auto 40px', lineHeight:1.7 }}
        >
          MedAI analyzes your health parameters and medical reports using advanced ML models to detect
          15+ diseases early, provide diet plans, exercise tips, and specialist recommendations — all in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35, duration:0.5 }}
          style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}
        >
          <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          style={{ display:'flex', justifyContent:'center', gap:40, marginTop:56, flexWrap:'wrap' }}
        >
          {[['15+','Diseases Detected'],['99%','Accuracy Rate'],['PDF','Report Analysis'],['24/7','AI Chatbot']].map(([val,label]) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-display)', color:'var(--accent-cyan)' }}>{val}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Diseases Grid */}
    <section style={{ padding:'80px 24px', maxWidth:1200, margin:'0 auto' }}>
      <motion.h2
        initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        style={{ textAlign:'center', fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:16 }}
      >
        15+ Disease Predictions
      </motion.h2>
      <p style={{ textAlign:'center', color:'var(--text-secondary)', marginBottom:48 }}>
        From Diabetes to Depression — comprehensive AI health screening
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:16 }}>
        {DISEASES.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }} transition={{ delay:i*0.04 }}
            className="glass-card"
            style={{ padding:'20px 12px', textAlign:'center', cursor:'pointer' }}
            whileHover={{ scale:1.05 }}
          >
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{d.icon}</div>
            <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-secondary)' }}>{d.name}</div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section style={{ padding:'80px 24px', maxWidth:1200, margin:'0 auto' }}>
      <motion.h2
        initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        style={{ textAlign:'center', fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:48 }}
      >
        Everything You Need for Health Intelligence
      </motion.h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:i*0.1 }}
            className="glass-card"
            style={{ padding:28 }}
          >
            <div style={{ fontSize:'2rem', marginBottom:14 }}>{f.icon}</div>
            <h3 style={{ fontFamily:'var(--font-display)', marginBottom:10, fontSize:'1.05rem' }}>{f.title}</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:1.6 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding:'80px 24px', textAlign:'center' }}>
      <motion.div
        initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
        className="glass-card"
        style={{ maxWidth:700, margin:'0 auto', padding:'60px 40px' }}
      >
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:16 }}>
          Start Your Health Journey Today
        </h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:32, fontSize:'1rem' }}>
          Free forever for personal use. No credit card required. Get your first prediction in 2 minutes.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account →</Link>
      </motion.div>
    </section>

    {/* Footer */}
    <footer style={{
      textAlign:'center', padding:'32px 24px',
      borderTop:'1px solid var(--border-subtle)',
      color:'var(--text-muted)', fontSize:'0.82rem'
    }}>
      © 2025 MedAI. Built for academic project submission. Not a substitute for professional medical advice.
    </footer>
  </div>
);

export default Home;
