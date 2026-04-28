import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageLayout from '../components/common/PageLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { calcBMI as calculateBMI, getBMICategory } from '../utils/helpers';

const Field = ({ label, children }) => (
  <div className="input-group">{label && <label className="input-label">{label}</label>}{children}</div>
);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0,10) : '',
    gender: user?.gender || '', bloodGroup: user?.bloodGroup || '',
    height: user?.height || '', weight: user?.weight || '',
    allergies: (user?.allergies || []).join(', '),
    medicalConditions: (user?.medicalConditions || []).join(', ')
  });
  const [passwords, setPasswords] = useState({ current:'', new:'', confirm:'' });
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const bmi = calculateBMI(form.weight, form.height);
  const bmiInfo = getBMICategory(parseFloat(bmi));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        allergies: form.allergies ? form.allergies.split(',').map(s=>s.trim()).filter(Boolean) : [],
        medicalConditions: form.medicalConditions ? form.medicalConditions.split(',').map(s=>s.trim()).filter(Boolean) : [],
        height: parseFloat(form.height) || undefined,
        weight: parseFloat(form.weight) || undefined
      };
      const res = await api.put('/users/profile', payload);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('New passwords do not match');
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password changed successfully!');
      setPasswords({ current:'', new:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.error || 'Password change failed'); }
    finally { setSaving(false); }
  };

  const set = f => e => setForm(p => ({...p, [f]: e.target.value}));
  const setP = f => e => setPasswords(p => ({...p, [f]: e.target.value}));

  return (
    <PageLayout>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>👤 Profile</h1>
        <p style={{ color:'var(--text-secondary)' }}>Manage your personal health information and account settings.</p>
      </motion.div>

      {/* Profile header card */}
      <div className="glass-card" style={{ padding:24, marginBottom:24, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--gradient-primary)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontFamily:'var(--font-display)', fontWeight:800, color:'#fff' }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize:'1.3rem', fontWeight:700, fontFamily:'var(--font-display)' }}>{user?.name}</div>
          <div style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>{user?.email}</div>
          <div style={{ marginTop:6, display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ background:'rgba(99,102,241,0.12)', color:'var(--accent-cyan)', borderRadius:6, padding:'2px 10px', fontSize:'0.75rem', fontWeight:600 }}>{user?.role}</span>
            {bmi && <span style={{ background:`${bmiInfo.color}22`, color:bmiInfo.color, borderRadius:6, padding:'2px 10px', fontSize:'0.75rem', fontWeight:600 }}>BMI: {bmi} ({bmiInfo.label})</span>}
          </div>
        </div>
        {user?.healthScore != null && (
          <div style={{ marginLeft:'auto', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', fontWeight:800, fontFamily:'var(--font-display)',
              color:user.healthScore>70?'#10b981':user.healthScore>40?'#f59e0b':'#f43f5e' }}>{user.healthScore}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Health Score</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'var(--bg-glass)', borderRadius:10, padding:4, border:'1px solid var(--border-glass)', marginBottom:20, width:'fit-content' }}>
        {['profile','security'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'7px 18px', borderRadius:7, border:'none', cursor:'pointer',
            background: tab===t ? 'var(--gradient-primary)' : 'transparent',
            color: tab===t ? '#fff' : 'var(--text-secondary)',
            fontWeight:600, fontSize:'0.85rem', fontFamily:'var(--font-body)'
          }}>{t === 'profile' ? '👤 Profile' : '🔐 Security'}</button>
        ))}
      </div>

      {tab === 'profile' ? (
        <motion.form initial={{ opacity:0 }} animate={{ opacity:1 }} onSubmit={saveProfile}
          className="glass-card" style={{ padding:28 }}>
          <h3 style={{ fontFamily:'var(--font-display)', marginBottom:20 }}>Personal Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16, marginBottom:20 }}>
            <Field label="Full Name"><input className="input-field" value={form.name} onChange={set('name')} required /></Field>
            <Field label="Phone"><input className="input-field" type="tel" value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Date of Birth"><input className="input-field" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
            <Field label="Gender">
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Blood Group">
              <select className="input-field" value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Height (cm)"><input className="input-field" type="number" min={100} max={250} value={form.height} onChange={set('height')} /></Field>
            <Field label="Weight (kg)"><input className="input-field" type="number" min={20} max={300} value={form.weight} onChange={set('weight')} /></Field>
            <Field label="Allergies (comma-separated)"><input className="input-field" value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin, Peanuts" /></Field>
            <Field label="Medical Conditions (comma-separated)">
              <input className="input-field" value={form.medicalConditions} onChange={set('medicalConditions')} placeholder="e.g. Hypertension, Asthma" />
            </Field>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
        </motion.form>
      ) : (
        <motion.form initial={{ opacity:0 }} animate={{ opacity:1 }} onSubmit={changePassword}
          className="glass-card" style={{ padding:28, maxWidth:420 }}>
          <h3 style={{ fontFamily:'var(--font-display)', marginBottom:20 }}>Change Password</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Field label="Current Password"><input className="input-field" type="password" value={passwords.current} onChange={setP('current')} required /></Field>
            <Field label="New Password"><input className="input-field" type="password" value={passwords.new} onChange={setP('new')} required minLength={6} /></Field>
            <Field label="Confirm New Password"><input className="input-field" type="password" value={passwords.confirm} onChange={setP('confirm')} required /></Field>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop:20 }} disabled={saving}>{saving ? '⏳ Updating...' : '🔐 Change Password'}</button>
        </motion.form>
      )}
    </PageLayout>
  );
};
export default Profile;
