import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageLayout from '../components/common/PageLayout';
import { predictDisease } from '../api/predictions';
import { DISEASE_LABELS, DISEASE_ICONS } from '../utils/helpers';

const DISEASE_FIELDS = {
  diabetes: [
    { key:'glucose', label:'Blood Glucose (mg/dL)', type:'number', placeholder:'e.g. 120', min:50, max:400 },
    { key:'blood_pressure', label:'Diastolic Blood Pressure (mmHg)', type:'number', placeholder:'e.g. 80', min:40, max:130 },
    { key:'skin_thickness', label:'Skin Thickness (mm)', type:'number', placeholder:'e.g. 25', min:5, max:60 },
    { key:'insulin', label:'Insulin (μU/mL)', type:'number', placeholder:'e.g. 80', min:0, max:400 },
    { key:'bmi', label:'BMI (kg/m²)', type:'number', placeholder:'e.g. 24.5', min:10, max:60 },
    { key:'age', label:'Age (years)', type:'number', placeholder:'e.g. 35', min:18, max:100 },
    { key:'pregnancies', label:'Number of Pregnancies', type:'number', placeholder:'e.g. 2', min:0, max:20 },
    { key:'diabetes_pedigree', label:'Diabetes Pedigree Function', type:'number', placeholder:'e.g. 0.5', min:0, max:3, step:'0.01' },
  ],
  heart_disease: [
    { key:'age', label:'Age (years)', type:'number', placeholder:'e.g. 50', min:18, max:100 },
    { key:'sex', label:'Sex (1=Male, 0=Female)', type:'number', placeholder:'1 or 0', min:0, max:1 },
    { key:'chest_pain_type', label:'Chest Pain Type (0-3)', type:'number', placeholder:'0-3', min:0, max:3 },
    { key:'resting_bp', label:'Resting Blood Pressure (mmHg)', type:'number', placeholder:'e.g. 130', min:80, max:220 },
    { key:'cholesterol', label:'Serum Cholesterol (mg/dL)', type:'number', placeholder:'e.g. 220', min:100, max:600 },
    { key:'fasting_blood_sugar', label:'Fasting Blood Sugar >120mg/dL (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'max_heart_rate', label:'Max Heart Rate Achieved (bpm)', type:'number', placeholder:'e.g. 150', min:60, max:220 },
    { key:'exercise_angina', label:'Exercise Induced Angina (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'st_depression', label:'ST Depression Induced by Exercise', type:'number', placeholder:'e.g. 1.5', min:0, max:10, step:'0.1' },
    { key:'cholesterol', label:'Cholesterol mg/dL', type:'number', placeholder:'e.g. 220', min:100, max:600 },
  ],
  bp_risk: [
    { key:'age', label:'Age', type:'number', placeholder:'e.g. 40', min:18, max:100 },
    { key:'bmi', label:'BMI', type:'number', placeholder:'e.g. 26', min:10, max:60 },
    { key:'sodium_intake', label:'Daily Sodium Intake (mg)', type:'number', placeholder:'e.g. 2000', min:500, max:6000 },
    { key:'stress_level', label:'Stress Level (1-10)', type:'number', placeholder:'1-10', min:1, max:10 },
    { key:'physical_activity', label:'Physical Activity (hrs/week)', type:'number', placeholder:'e.g. 3', min:0, max:30 },
    { key:'smoking', label:'Smoking (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'alcohol', label:'Alcohol Use (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'family_history', label:'Family History of BP (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
  ],
  kidney_disease: [
    { key:'age', label:'Age', type:'number', placeholder:'e.g. 45', min:18, max:100 },
    { key:'blood_pressure', label:'Blood Pressure (mmHg)', type:'number', placeholder:'e.g. 80', min:40, max:200 },
    { key:'albumin', label:'Albumin (0-4)', type:'number', placeholder:'0-4', min:0, max:4 },
    { key:'sugar', label:'Sugar Level (0-5)', type:'number', placeholder:'0-5', min:0, max:5 },
    { key:'blood_glucose', label:'Blood Glucose (mg/dL)', type:'number', placeholder:'e.g. 120', min:70, max:500 },
    { key:'blood_urea', label:'Blood Urea (mg/dL)', type:'number', placeholder:'e.g. 30', min:5, max:200 },
    { key:'serum_creatinine', label:'Serum Creatinine (mg/dL)', type:'number', placeholder:'e.g. 1.0', min:0.5, max:15, step:'0.1' },
    { key:'haemoglobin', label:'Haemoglobin (g/dL)', type:'number', placeholder:'e.g. 13', min:5, max:20 },
  ],
  liver_disease: [
    { key:'age', label:'Age', type:'number', placeholder:'e.g. 40', min:18, max:100 },
    { key:'gender', label:'Gender (1=Male, 0=Female)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'total_bilirubin', label:'Total Bilirubin (mg/dL)', type:'number', placeholder:'e.g. 0.8', min:0.1, max:30, step:'0.1' },
    { key:'direct_bilirubin', label:'Direct Bilirubin (mg/dL)', type:'number', placeholder:'e.g. 0.2', min:0, max:15, step:'0.1' },
    { key:'alkaline_phosphotase', label:'Alkaline Phosphatase (U/L)', type:'number', placeholder:'e.g. 200', min:40, max:2000 },
    { key:'alamine_aminotransferase', label:'SGPT/ALT (U/L)', type:'number', placeholder:'e.g. 35', min:5, max:500 },
    { key:'aspartate_aminotransferase', label:'SGOT/AST (U/L)', type:'number', placeholder:'e.g. 32', min:5, max:500 },
    { key:'total_proteins', label:'Total Proteins (g/dL)', type:'number', placeholder:'e.g. 7', min:3, max:10, step:'0.1' },
    { key:'albumin', label:'Albumin (g/dL)', type:'number', placeholder:'e.g. 3.7', min:1, max:6, step:'0.1' },
  ],
  thyroid: [
    { key:'age', label:'Age', type:'number', placeholder:'e.g. 35', min:18, max:100 },
    { key:'sex', label:'Sex (1=Male, 0=Female)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'tsh', label:'TSH Level (mIU/L)', type:'number', placeholder:'e.g. 2.5', min:0, max:20, step:'0.1' },
    { key:'t3', label:'T3 Level (ng/dL)', type:'number', placeholder:'e.g. 130', min:50, max:300 },
    { key:'t4', label:'T4 Level (ug/dL)', type:'number', placeholder:'e.g. 8', min:3, max:20, step:'0.1' },
    { key:'on_thyroxine', label:'On Thyroxine Medication (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
  ],
  anemia: [
    { key:'gender', label:'Gender (1=Male, 0=Female)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'haemoglobin', label:'Haemoglobin (g/dL)', type:'number', placeholder:'e.g. 13', min:5, max:20, step:'0.1' },
    { key:'mch', label:'MCH (pg)', type:'number', placeholder:'e.g. 28', min:15, max:45, step:'0.1' },
    { key:'mchc', label:'MCHC (g/dL)', type:'number', placeholder:'e.g. 33', min:25, max:40, step:'0.1' },
    { key:'mcv', label:'MCV (fL)', type:'number', placeholder:'e.g. 85', min:60, max:120, step:'0.1' },
  ],
  general_health: [
    { key:'age', label:'Age', type:'number', placeholder:'e.g. 35', min:18, max:100 },
    { key:'gender', label:'Gender (1=Male, 0=Female)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'bmi', label:'BMI', type:'number', placeholder:'e.g. 24.5', min:10, max:60, step:'0.1' },
    { key:'blood_pressure', label:'Blood Pressure (mmHg)', type:'number', placeholder:'e.g. 120', min:70, max:220 },
    { key:'glucose', label:'Blood Glucose (mg/dL)', type:'number', placeholder:'e.g. 95', min:50, max:400 },
    { key:'cholesterol', label:'Cholesterol (mg/dL)', type:'number', placeholder:'e.g. 180', min:100, max:400 },
    { key:'smoking', label:'Smoking (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'alcohol', label:'Alcohol Use (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
    { key:'physical_activity', label:'Physical Activity (hrs/week)', type:'number', placeholder:'e.g. 4', min:0, max:30 },
    { key:'sleep_hours', label:'Sleep Hours/day', type:'number', placeholder:'e.g. 7', min:3, max:12, step:'0.5' },
    { key:'stress_level', label:'Stress Level (1-10)', type:'number', placeholder:'1-10', min:1, max:10 },
  ],
};

// For diseases without custom fields, use a generic set
const GENERIC_FIELDS = [
  { key:'age', label:'Age', type:'number', placeholder:'e.g. 35', min:18, max:100 },
  { key:'gender', label:'Gender (1=Male, 0=Female)', type:'number', placeholder:'0 or 1', min:0, max:1 },
  { key:'bmi', label:'BMI', type:'number', placeholder:'e.g. 24.5', min:10, max:60, step:'0.1' },
  { key:'smoking', label:'Smoking (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
  { key:'family_history', label:'Family History (1=Yes)', type:'number', placeholder:'0 or 1', min:0, max:1 },
  { key:'physical_activity', label:'Physical Activity (hrs/week)', type:'number', placeholder:'e.g. 3', min:0, max:30 },
  { key:'stress_level', label:'Stress Level (1-10)', type:'number', placeholder:'1-10', min:1, max:10 },
  { key:'sleep_hours', label:'Sleep Hours/day', type:'number', placeholder:'e.g. 7', min:3, max:12, step:'0.5' },
];

const ALL_DISEASES = Object.keys(DISEASE_LABELS);

const PredictionForm = () => {
  const navigate = useNavigate();
  const { diseaseType: paramDisease } = useParams();
  const [selectedDisease, setSelectedDisease] = useState(paramDisease || '');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const fields = selectedDisease
    ? (DISEASE_FIELDS[selectedDisease] || GENERIC_FIELDS)
    : [];

  const handleSelect = (d) => {
    setSelectedDisease(d);
    setFormData({});
  };

  const handleChange = (key, val) => {
    setFormData(f => ({ ...f, [key]: parseFloat(val) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDisease) return toast.error('Please select a disease to predict');
    if (fields.some(f => formData[f.key] === undefined)) {
      return toast.error('Please fill all fields');
    }
    setLoading(true);
    try {
      const res = await predictDisease(selectedDisease, formData);
      toast.success('Prediction complete!');
      navigate(`/results/${res.data.prediction._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>AI Disease Prediction</h1>
        <p style={{ color:'var(--text-secondary)' }}>Select a disease and enter your health parameters for an AI-powered risk assessment.</p>
      </motion.div>

      {/* Disease Selector */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        className="glass-card" style={{ padding:24, marginBottom:24 }}>
        <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16, fontSize:'1rem' }}>Select Disease to Predict</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
          {ALL_DISEASES.map(d => (
            <button key={d} onClick={() => handleSelect(d)}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                borderRadius:10, border:`1px solid ${selectedDisease===d?'var(--accent-indigo)':'var(--border-glass)'}`,
                background: selectedDisease===d ? 'rgba(99,102,241,0.15)' : 'var(--bg-glass)',
                color: selectedDisease===d ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor:'pointer', fontSize:'0.82rem', fontWeight:500, transition:'all 0.2s', textAlign:'left'
              }}>
              <span>{DISEASE_ICONS[d]}</span>
              <span>{DISEASE_LABELS[d]}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Input Form */}
      {selectedDisease && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="glass-card" style={{ padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <span style={{ fontSize:'2rem' }}>{DISEASE_ICONS[selectedDisease]}</span>
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem' }}>{DISEASE_LABELS[selectedDisease]}</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>Enter your health parameters below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16, marginBottom:24 }}>
              {fields.map(field => (
                <div key={field.key} className="input-group">
                  <label className="input-label">{field.label}</label>
                  <input
                    className="input-field"
                    type={field.type}
                    placeholder={field.placeholder}
                    min={field.min} max={field.max}
                    step={field.step || (field.type==='number'?'any':undefined)}
                    value={formData[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(99,102,241,0.07)', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:'0.8rem', color:'var(--text-muted)' }}>
              ⚠️ Results are AI-generated estimates for educational purposes only. Always consult a qualified healthcare professional for medical advice.
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth:160 }}>
                {loading ? '🤖 Predicting...' : '🔬 Predict Now'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setSelectedDisease(''); setFormData({}); }}>
                Reset
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {!selectedDisease && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🔬</div>
          <p>Select a disease above to start your prediction</p>
        </motion.div>
      )}
    </PageLayout>
  );
};
export default PredictionForm;
