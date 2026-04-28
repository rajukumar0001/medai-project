import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import PageLayout from '../components/common/PageLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';

const QUICK_QUESTIONS = [
  'What are symptoms of diabetes?', 'How to lower blood pressure?', 'What is BMI and how to calculate it?',
  'What does high cholesterol mean?', 'How to improve sleep quality?', 'What are heart disease risk factors?',
  'Tell me about thyroid disease', 'How to reduce stress naturally?'
];

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    id: 1, role: 'assistant', content: `👋 Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! I'm **MedAI Assistant** — your personal health AI.\n\nI can help you with:\n- 🔬 Disease information\n- 💊 Symptoms guidance\n- 🥗 Diet & nutrition tips\n- 🏃 Exercise recommendations\n- 📄 Report analysis guidance\n- 🏥 Doctor recommendations\n\nWhat health topic can I help you with today?`,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role:'user', content:msg, timestamp:new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role:m.role, content:m.content }));
      const res = await api.post('/chatbot/message', { message:msg, history });
      setMessages(m => [...m, { id: Date.now()+1, role:'assistant', content:res.data.reply, timestamp:new Date() }]);
    } catch {
      setMessages(m => [...m, { id: Date.now()+1, role:'assistant',
        content:'Sorry, I encountered an error. Please try again or check your connection.', timestamp:new Date() }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>🤖 AI Health Chatbot</h1>
        <p style={{ color:'var(--text-secondary)' }}>Get instant answers to your health questions, 24/7.</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20, height:'calc(100vh - 260px)', minHeight:500 }}>
        {/* Chat window */}
        <div className="glass-card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity:0, y:10, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.25 }}
                  style={{ display:'flex', flexDirection:msg.role==='user'?'row-reverse':'row', gap:10, alignItems:'flex-end' }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%', flexShrink:0,
                    background: msg.role==='user' ? 'var(--gradient-primary)' : 'linear-gradient(135deg,#10b981,#3b82f6)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem'
                  }}>
                    {msg.role==='user' ? (user?.name?.[0]?.toUpperCase()||'U') : '🤖'}
                  </div>
                  <div style={{
                    maxWidth:'72%',
                    background: msg.role==='user' ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                    border: msg.role==='assistant' ? '1px solid var(--border-glass)' : 'none',
                    borderRadius: msg.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding:'12px 16px'
                  }}>
                    <div style={{ fontSize:'0.88rem', lineHeight:1.7, color: msg.role==='user'?'#fff':'var(--text-primary)' }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div style={{ fontSize:'0.68rem', color: msg.role==='user'?'rgba(255,255,255,0.6)':'var(--text-muted)', marginTop:6, textAlign:msg.role==='user'?'right':'left' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center' }}>🤖</div>
                  <div className="glass-card" style={{ padding:'12px 18px', borderRadius:'16px 16px 16px 4px' }}>
                    <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ repeat:Infinity, duration:1.2 }}
                      style={{ display:'flex', gap:4 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent-cyan)' }} />)}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:10 }}>
            <textarea
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask a health question... (Enter to send)"
              rows={1} style={{
                flex:1, background:'var(--bg-glass)', border:'1px solid var(--border-glass)',
                borderRadius:12, padding:'10px 14px', color:'var(--text-primary)',
                fontSize:'0.9rem', resize:'none', outline:'none', fontFamily:'var(--font-body)',
                maxHeight:120, overflowY:'auto'
              }} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="btn btn-primary" style={{ padding:'10px 16px', borderRadius:12, flexShrink:0 }}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>

        {/* Quick Questions Panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="glass-card" style={{ padding:18 }}>
            <h4 style={{ fontFamily:'var(--font-display)', marginBottom:12, fontSize:'0.95rem' }}>💡 Quick Questions</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                  style={{
                    textAlign:'left', padding:'9px 12px', background:'var(--bg-glass)',
                    border:'1px solid var(--border-glass)', borderRadius:8,
                    color:'var(--text-secondary)', cursor:'pointer', fontSize:'0.78rem',
                    lineHeight:1.4, transition:'all 0.2s', fontFamily:'var(--font-body)'
                  }}
                  onMouseEnter={e => { e.target.style.borderColor='var(--accent-indigo)'; e.target.style.color='var(--text-primary)'; }}
                  onMouseLeave={e => { e.target.style.borderColor='var(--border-glass)'; e.target.style.color='var(--text-secondary)'; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:14 }}>
            <p style={{ fontSize:'0.75rem', color:'#10b981', lineHeight:1.6 }}>
              💙 This chatbot provides general health information only. Always consult a qualified doctor for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default Chatbot;
