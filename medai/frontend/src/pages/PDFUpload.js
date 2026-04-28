import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import PageLayout from '../components/common/PageLayout';
import { uploadReport } from '../api/reports';
import { formatBytes } from '../utils/helpers';

const REPORT_TYPES = [
  { value:'CBC', label:'CBC — Complete Blood Count' },
  { value:'sugar', label:'Blood Sugar / HbA1c' },
  { value:'lipid', label:'Lipid Profile' },
  { value:'thyroid', label:'Thyroid Function (TSH/T3/T4)' },
  { value:'LFT', label:'Liver Function Test (LFT)' },
  { value:'KFT', label:'Kidney Function Test (KFT)' },
  { value:'ECG', label:'ECG Report' },
  { value:'general_checkup', label:'General Health Checkup' },
];

const PDFUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) return toast.error('Only PDF/JPG/PNG files up to 10MB allowed');
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf':[], 'image/jpeg':[], 'image/png':[] },
    maxSize: 10*1024*1024, multiple: false
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    if (!reportType) return toast.error('Please select report type');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('report', file);
      fd.append('reportType', reportType);
      if (reportDate) fd.append('reportDate', reportDate);
      const res = await uploadReport(fd, setProgress);
      toast.success('Report uploaded! Analysis in progress...');
      navigate(`/reports/${res.data.reportId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); setProgress(0); }
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>📄 Upload Medical Report</h1>
        <p style={{ color:'var(--text-secondary)' }}>Upload your PDF medical report for AI-powered analysis, parameter extraction, and risk detection.</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          {/* Drop zone */}
          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-cyan)' : file ? 'var(--accent-emerald)' : 'var(--border-glass)'}`,
            borderRadius: 16, padding: '48px 32px', textAlign: 'center', cursor:'pointer',
            background: isDragActive ? 'rgba(0,229,255,0.05)' : file ? 'rgba(16,185,129,0.05)' : 'var(--bg-glass)',
            transition: 'all 0.3s', marginBottom:20
          }}>
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div key="file" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
                  <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
                  <div style={{ fontWeight:600, color:'#10b981', marginBottom:4 }}>{file.name}</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{formatBytes(file.size)}</div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{ marginTop:12, background:'none', border:'1px solid var(--border-glass)', borderRadius:6,
                      padding:'4px 12px', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.8rem' }}>
                    Remove
                  </button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div style={{ fontSize:'3.5rem', marginBottom:12 }}>{isDragActive ? '📂' : '📁'}</div>
                  <p style={{ fontSize:'1rem', fontWeight:600, marginBottom:6 }}>
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your medical report'}
                  </p>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:12 }}>or click to browse files</p>
                  <div style={{ display:'inline-block', background:'rgba(99,102,241,0.1)', borderRadius:6,
                    padding:'4px 14px', fontSize:'0.78rem', color:'var(--text-muted)' }}>
                    PDF, JPG, PNG • Max 10MB
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form fields */}
          <div className="glass-card" style={{ padding:24 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="input-group">
                <label className="input-label">Report Type *</label>
                <select className="input-field" value={reportType} onChange={e => setReportType(e.target.value)} required>
                  <option value="">Select report type...</option>
                  {REPORT_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Report Date (optional)</label>
                <input className="input-field" type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
              </div>
            </div>

            {uploading && (
              <div style={{ marginTop:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                  <span>Uploading...</span><span>{progress}%</span>
                </div>
                <div style={{ background:'var(--bg-glass)', borderRadius:100, height:6 }}>
                  <motion.div animate={{ width:`${progress}%` }} style={{ height:'100%', borderRadius:100, background:'var(--gradient-primary)' }} />
                </div>
              </div>
            )}

            <button onClick={handleUpload} className="btn btn-primary btn-full" disabled={!file || !reportType || uploading}
              style={{ marginTop:20 }}>
              {uploading ? '⏳ Uploading & Analyzing...' : '🚀 Upload & Analyze'}
            </button>
          </div>
        </motion.div>

        {/* Info panel */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
          style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="glass-card" style={{ padding:22 }}>
            <h4 style={{ fontFamily:'var(--font-display)', marginBottom:14 }}>🤖 AI Analysis Includes</h4>
            {['Text extraction from PDF','Parameter identification','Normal range comparison','Abnormal value highlighting',
              'Risk prediction','Comprehensive summary','Actionable recommendations'].map(item => (
              <div key={item} style={{ display:'flex', gap:8, marginBottom:8, fontSize:'0.83rem', color:'var(--text-secondary)' }}>
                <span style={{ color:'#10b981' }}>✓</span> {item}
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding:22 }}>
            <h4 style={{ fontFamily:'var(--font-display)', marginBottom:14 }}>📋 Supported Reports</h4>
            {REPORT_TYPES.map(rt => (
              <div key={rt.value} style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:6 }}>• {rt.label}</div>
            ))}
          </div>
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16 }}>
            <p style={{ fontSize:'0.78rem', color:'#f59e0b', lineHeight:1.6 }}>
              ⚠️ For best results, upload clear, text-based PDF reports. Scanned images may have lower accuracy.
            </p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};
export default PDFUpload;
