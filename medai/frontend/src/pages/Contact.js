import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, connect to a backend email API
    setSent(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:700, margin:'0 auto', padding:'100px 24px 60px' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', marginBottom:8 }}>📬 Contact Us</h1>
          <p style={{ color:'var(--text-secondary)', marginBottom:40 }}>
            Have questions about MedAI? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>

          {sent ? (
            <div className="glass-card" style={{ padding:40, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
              <h3 style={{ fontFamily:'var(--font-display)', marginBottom:8 }}>Message Sent!</h3>
              <p style={{ color:'var(--text-secondary)' }}>Thank you for reaching out. We'll get back to you at {form.email}.</p>
              <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => setSent(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card" style={{ padding:32, display:'flex', flexDirection:'column', gap:18 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required placeholder="John Doe" />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address *</label>
                  <input className="input-field" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required placeholder="you@example.com" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Subject *</label>
                <input className="input-field" value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} required placeholder="How can we help?" />
              </div>
              <div className="input-group">
                <label className="input-label">Message *</label>
                <textarea className="input-field" rows={5} value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} required placeholder="Describe your query or feedback..." style={{ resize:'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Send Message →</button>
            </form>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginTop:32 }}>
            {[
              { icon:'📧', label:'Email', value:'support@medai.com' },
              { icon:'🌐', label:'Website', value:'medai.vercel.app' },
              { icon:'🏫', label:'Project', value:'Final Year Project 2025' },
            ].map(item => (
              <div key={item.label} className="glass-card" style={{ padding:18, textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{item.icon}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>{item.label}</div>
                <div style={{ fontSize:'0.82rem', color:'var(--text-primary)', fontWeight:500 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Contact;
