import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/common/PageLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import { getReport, deleteReport } from '../api/reports';
import { getStatusColor, formatDateTime, formatBytes } from '../utils/helpers';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const colors = { normal:'#10b981', borderline:'#f59e0b', abnormal:'#f43f5e', critical:'#ef4444', low:'#3b82f6', high:'#f43f5e' };
  const c = colors[status] || '#94a3b8';
  return (
    <span style={{ background:`${c}22`, color:c, border:`1px solid ${c}44`,
      borderRadius:4, padding:'2px 8px', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase' }}>
      {status}
    </span>
  );
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const res = await getReport(id);
      setReport(res.data.report);
      if (res.data.report.processingStatus === 'processing') setPolling(true);
      else setPolling(false);
    } catch { toast.error('Failed to load report'); navigate('/history'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(fetchReport, 3000);
    return () => clearInterval(interval);
  }, [polling, fetchReport]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this report?')) return;
    try { await deleteReport(id); toast.success('Report deleted'); navigate('/history'); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <LoadingScreen message="Loading report..." />;
  if (!report) return null;

  const { analysis, parameters, abnormalValues, processingStatus } = report;

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <Link to="/history?tab=reports" style={{ color:'var(--text-muted)', fontSize:'0.85rem', textDecoration:'none' }}>← Back to History</Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginTop:12, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem' }}>{report.originalName}</h1>
            <div style={{ display:'flex', gap:12, marginTop:6, fontSize:'0.8rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
              <span>📅 {formatDateTime(report.createdAt)}</span>
              <span>📦 {formatBytes(report.fileSize)}</span>
              <span>📋 {report.reportType?.toUpperCase()}</span>
              {report.labName && <span>🏥 {report.labName}</span>}
            </div>
          </div>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">🗑️ Delete</button>
        </div>
      </motion.div>

      {/* Processing Status */}
      {processingStatus === 'processing' && (
        <motion.div animate={{ opacity:[1,0.5,1] }} transition={{ repeat:Infinity, duration:1.5 }}
          className="glass-card" style={{ padding:24, textAlign:'center', marginBottom:20 }}>
          <div className="spinner" style={{ margin:'0 auto 12px' }} />
          <p style={{ color:'var(--accent-cyan)', fontWeight:600 }}>🤖 AI is analyzing your report...</p>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:4 }}>This may take 20-60 seconds. Page auto-updates.</p>
        </motion.div>
      )}

      {processingStatus === 'failed' && (
        <div className="glass-card" style={{ padding:24, marginBottom:20, borderLeft:'3px solid #f43f5e' }}>
          <h4 style={{ color:'#f43f5e', marginBottom:8 }}>⚠️ Analysis Failed</h4>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>{report.processingError || 'The AI could not process this file. Please try a clearer PDF.'}</p>
        </div>
      )}

      {processingStatus === 'completed' && (
        <>
          {/* Summary */}
          {analysis?.summary && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card"
              style={{ padding:24, marginBottom:20, borderLeft:`3px solid ${getStatusColor(analysis.overallStatus)}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <h3 style={{ fontFamily:'var(--font-display)' }}>📊 Analysis Summary</h3>
                <StatusBadge status={analysis.overallStatus} />
              </div>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.7, fontSize:'0.92rem' }}>{analysis.summary}</p>
            </motion.div>
          )}

          {/* Abnormal Values */}
          {abnormalValues?.length > 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
              className="glass-card" style={{ padding:24, marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16, color:'#f43f5e' }}>⚠️ Abnormal Values ({abnormalValues.length})</h3>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                      {['Parameter','Your Value','Unit','Normal Range','Status','Severity'].map(h => (
                        <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--text-muted)', fontWeight:600, fontSize:'0.78rem', textTransform:'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {abnormalValues.map((v, i) => (
                      <tr key={i} style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                        <td style={{ padding:'10px 12px', fontWeight:600 }}>{v.parameter}</td>
                        <td style={{ padding:'10px 12px', color:getStatusColor(v.status), fontWeight:700 }}>{v.value}</td>
                        <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{v.unit}</td>
                        <td style={{ padding:'10px 12px', color:'var(--text-secondary)' }}>{v.normalRange}</td>
                        <td style={{ padding:'10px 12px' }}><StatusBadge status={v.status} /></td>
                        <td style={{ padding:'10px 12px', color:'var(--text-secondary)', textTransform:'capitalize' }}>{v.severity || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* All Parameters */}
          {parameters?.length > 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
              className="glass-card" style={{ padding:24, marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16 }}>📋 All Parameters ({parameters.length})</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                {parameters.map((p, i) => (
                  <div key={i} style={{
                    padding:'10px 14px', borderRadius:8, border:`1px solid ${getStatusColor(p.status)}44`,
                    background:`${getStatusColor(p.status)}09`
                  }}>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase' }}>{p.parameter}</div>
                    <div style={{ fontWeight:700, color:getStatusColor(p.status), fontSize:'1.05rem', marginTop:2 }}>{p.value} <span style={{ fontSize:'0.7rem', fontWeight:400 }}>{p.unit}</span></div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:2 }}>Normal: {p.normalRange}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          {analysis?.recommendations?.length > 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
              className="glass-card" style={{ padding:24, marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', marginBottom:14 }}>💡 Recommendations</h3>
              {analysis.recommendations.map((rec, i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, fontSize:'0.88rem', color:'var(--text-secondary)' }}>
                  <span style={{ color:'var(--accent-emerald)', flexShrink:0 }}>{i+1}.</span> {rec}
                </div>
              ))}
            </motion.div>
          )}

          {/* Predicted Risks */}
          {analysis?.predictedRisks?.length > 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}
              className="glass-card" style={{ padding:24 }}>
              <h3 style={{ fontFamily:'var(--font-display)', marginBottom:14 }}>🎯 Predicted Risks</h3>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {analysis.predictedRisks.map(r => (
                  <span key={r} style={{ background:'rgba(244,63,94,0.12)', color:'#f43f5e',
                    border:'1px solid rgba(244,63,94,0.3)', borderRadius:8, padding:'6px 14px', fontSize:'0.84rem', fontWeight:600 }}>
                    ⚠️ {r}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      <div style={{ display:'flex', gap:12, marginTop:24, flexWrap:'wrap' }}>
        <Link to="/upload" className="btn btn-primary">📄 Upload Another</Link>
        <Link to="/predict" className="btn btn-secondary">🔬 Run Prediction</Link>
        <Link to="/chatbot" className="btn btn-secondary">🤖 Ask AI Chat</Link>
      </div>
    </PageLayout>
  );
};
export default ReportDetail;
