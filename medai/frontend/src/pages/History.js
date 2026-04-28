import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/common/PageLayout';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import { getPredictionHistory, deletePrediction } from '../api/predictions';
import { getReports, deleteReport } from '../api/reports';
import { DISEASE_LABELS, DISEASE_ICONS, formatDateTime, formatBytes } from '../utils/helpers';
import toast from 'react-hot-toast';

const History = () => {
  const [tab, setTab] = useState('predictions');
  const [predictions, setPredictions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'predictions') {
        const res = await getPredictionHistory({ page, limit:10 });
        setPredictions(res.data.predictions);
        setTotalPages(res.data.pagination.total);
      } else {
        const res = await getReports({ page, limit:10 });
        setReports(res.data.reports);
        setTotalPages(res.data.pagination.total);
      }
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  }, [tab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'prediction') { await deletePrediction(deleteTarget.id); setPredictions(p => p.filter(x => x._id !== deleteTarget.id)); }
      else { await deleteReport(deleteTarget.id); setReports(r => r.filter(x => x._id !== deleteTarget.id)); }
      toast.success('Deleted successfully');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  const filteredPredictions = predictions.filter(p =>
    DISEASE_LABELS[p.diseaseType]?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReports = reports.filter(r =>
    r.originalName?.toLowerCase().includes(search.toLowerCase()) || r.reportType?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = { completed:'#10b981', processing:'#f59e0b', failed:'#f43f5e', pending:'#94a3b8' };

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>📋 History</h1>
        <p style={{ color:'var(--text-secondary)' }}>View and manage all your predictions and uploaded reports.</p>
      </motion.div>

      {/* Tabs + Search */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:4, background:'var(--bg-glass)', borderRadius:10, padding:4, border:'1px solid var(--border-glass)' }}>
          {['predictions','reports'].map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              style={{
                padding:'7px 18px', borderRadius:7, border:'none', cursor:'pointer',
                background: tab===t ? 'var(--gradient-primary)' : 'transparent',
                color: tab===t ? '#fff' : 'var(--text-secondary)',
                fontWeight:600, fontSize:'0.85rem', transition:'all 0.2s', fontFamily:'var(--font-body)'
              }}>
              {t === 'predictions' ? '🔬 Predictions' : '📄 Reports'}
            </button>
          ))}
        </div>
        <input className="input-field" style={{ maxWidth:240, padding:'8px 14px' }}
          placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
      ) : tab === 'predictions' ? (
        filteredPredictions.length === 0 ? (
          <EmptyState icon="🔬" title="No predictions yet"
            description="Run your first AI disease prediction to see results here."
            action={<Link to="/predict" className="btn btn-primary">Start Predicting →</Link>} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filteredPredictions.map((pred, i) => (
              <motion.div key={pred._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="glass-card" style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:'1.6rem' }}>{DISEASE_ICONS[pred.diseaseType] || '🔬'}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{DISEASE_LABELS[pred.diseaseType] || pred.diseaseType}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{formatDateTime(pred.createdAt)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)' }}>{pred.result.probability.toFixed(1)}% risk</span>
                  <RiskBadge risk={pred.result.riskLevel} size="sm" />
                  <div style={{ display:'flex', gap:8 }}>
                    <Link to={`/results/${pred._id}`} className="btn btn-sm btn-secondary">View</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget({ id:pred._id, type:'prediction' })}>✕</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        filteredReports.length === 0 ? (
          <EmptyState icon="📄" title="No reports uploaded"
            description="Upload your medical reports for AI analysis."
            action={<Link to="/upload" className="btn btn-primary">Upload Report →</Link>} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filteredReports.map((rep, i) => (
              <motion.div key={rep._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="glass-card" style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:'1.6rem' }}>📄</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{rep.originalName}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      {rep.reportType?.toUpperCase()} • {formatBytes(rep.fileSize)} • {formatDateTime(rep.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:600, color:statusColor[rep.processingStatus] || '#94a3b8',
                    background:`${statusColor[rep.processingStatus]}22`, padding:'3px 10px', borderRadius:6 }}>
                    {rep.processingStatus}
                  </span>
                  <div style={{ display:'flex', gap:8 }}>
                    <Link to={`/reports/${rep._id}`} className="btn btn-sm btn-secondary">View</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget({ id:rep._id, type:'report' })}>✕</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
          <button className="btn btn-sm btn-secondary" disabled={page<=1} onClick={() => setPage(p => p-1)}>← Prev</button>
          <span style={{ padding:'6px 14px', color:'var(--text-secondary)', fontSize:'0.85rem' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-secondary" disabled={page>=totalPages} onClick={() => setPage(p => p+1)}>Next →</button>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Delete Item" message="This action cannot be undone. Are you sure?"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Delete" danger />
    </PageLayout>
  );
};
export default History;
