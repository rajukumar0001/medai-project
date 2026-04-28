export const formatDate = (d) => d ? new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d)) : 'N/A';
export const formatDateTime = (d) => d ? new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(d)) : 'N/A';
export const formatBytes = (b) => { if(!b)return'0 B'; const s=['B','KB','MB','GB'],i=Math.floor(Math.log(b)/Math.log(1024)); return`${(b/Math.pow(1024,i)).toFixed(1)} ${s[i]}`; };
export const getRiskColor = (r) => ({Low:'#10b981',Moderate:'#f59e0b',High:'#f43f5e',Critical:'#ef4444'}[r]||'#94a3b8');
export const getRiskBadgeClass = (r) => `badge ${({Low:'badge-low',Moderate:'badge-moderate',High:'badge-high',Critical:'badge-critical'}[r]||'badge-info')}`;
export const getStatusColor = (s) => ({normal:'#10b981',borderline:'#f59e0b',abnormal:'#f43f5e',critical:'#ef4444'}[s]||'#94a3b8');
export const calcBMI = (w,h) => h&&w ? (w/((h/100)**2)).toFixed(1) : null;
export const getBMICategory = (b) => {
  if(!b) return {label:'Unknown',color:'#94a3b8'};
  if(b<18.5) return {label:'Underweight',color:'#3b82f6'};
  if(b<25)   return {label:'Normal',color:'#10b981'};
  if(b<30)   return {label:'Overweight',color:'#f59e0b'};
  return {label:'Obese',color:'#f43f5e'};
};
export const truncate = (s,n=50) => s&&s.length>n ? s.slice(0,n)+'...' : s;
export const debounce = (fn,d) => { let t; return (...a) => { clearTimeout(t); t=setTimeout(()=>fn(...a),d); }; };

export const DISEASE_LABELS = {
  diabetes:'Diabetes', heart_disease:'Heart Disease', bp_risk:'BP Risk',
  kidney_disease:'Kidney Disease', liver_disease:'Liver Disease', thyroid:'Thyroid',
  anemia:'Anemia', cholesterol:'Cholesterol', obesity:'Obesity Risk',
  stroke:'Stroke Risk', stress:'Stress Level', depression:'Depression Risk',
  pcos:'PCOS Risk', arthritis:'Arthritis Risk', general_health:'General Health'
};
export const DISEASE_ICONS = {
  diabetes:'🩸', heart_disease:'❤️', bp_risk:'🫀', kidney_disease:'🫘',
  liver_disease:'🟫', thyroid:'🦋', anemia:'💉', cholesterol:'🧪',
  obesity:'⚖️', stroke:'🧠', stress:'😰', depression:'💙',
  pcos:'🔬', arthritis:'🦴', general_health:'💊'
};
export const DISEASE_LIST = Object.entries(DISEASE_LABELS).map(([key,label])=>({key,label,icon:DISEASE_ICONS[key]}));
