"""
Medical Report Analyzer
Extracts text from PDFs, identifies parameters, compares with normal ranges
"""
import re, base64, os, json, logging, tempfile
from datetime import datetime

logger = logging.getLogger(__name__)

NORMAL_RANGES = {
    # CBC
    'haemoglobin': {'male': (13.5, 17.5), 'female': (12.0, 15.5), 'unit': 'g/dL'},
    'wbc': {'male': (4.5, 11.0), 'female': (4.5, 11.0), 'unit': 'K/uL'},
    'platelets': {'male': (150, 400), 'female': (150, 400), 'unit': 'K/uL'},
    'rbc': {'male': (4.7, 6.1), 'female': (4.2, 5.4), 'unit': 'M/uL'},
    'hematocrit': {'male': (41, 53), 'female': (36, 46), 'unit': '%'},
    'mcv': {'male': (80, 100), 'female': (80, 100), 'unit': 'fL'},
    'mch': {'male': (27, 33), 'female': (27, 33), 'unit': 'pg'},
    'mchc': {'male': (32, 36), 'female': (32, 36), 'unit': 'g/dL'},
    # Blood Sugar
    'fasting_glucose': {'male': (70, 100), 'female': (70, 100), 'unit': 'mg/dL'},
    'postprandial_glucose': {'male': (70, 140), 'female': (70, 140), 'unit': 'mg/dL'},
    'hba1c': {'male': (4.0, 5.6), 'female': (4.0, 5.6), 'unit': '%'},
    'random_glucose': {'male': (70, 140), 'female': (70, 140), 'unit': 'mg/dL'},
    # Lipid Profile
    'total_cholesterol': {'male': (0, 200), 'female': (0, 200), 'unit': 'mg/dL'},
    'ldl': {'male': (0, 100), 'female': (0, 100), 'unit': 'mg/dL'},
    'hdl': {'male': (40, 60), 'female': (50, 60), 'unit': 'mg/dL'},
    'triglycerides': {'male': (0, 150), 'female': (0, 150), 'unit': 'mg/dL'},
    'vldl': {'male': (5, 40), 'female': (5, 40), 'unit': 'mg/dL'},
    # LFT
    'sgpt': {'male': (7, 40), 'female': (7, 35), 'unit': 'U/L'},
    'sgot': {'male': (10, 40), 'female': (10, 35), 'unit': 'U/L'},
    'alkaline_phosphatase': {'male': (40, 130), 'female': (35, 105), 'unit': 'U/L'},
    'total_bilirubin': {'male': (0.2, 1.2), 'female': (0.2, 1.2), 'unit': 'mg/dL'},
    'direct_bilirubin': {'male': (0, 0.3), 'female': (0, 0.3), 'unit': 'mg/dL'},
    'albumin': {'male': (3.5, 5.0), 'female': (3.5, 5.0), 'unit': 'g/dL'},
    'total_protein': {'male': (6.3, 8.2), 'female': (6.3, 8.2), 'unit': 'g/dL'},
    # KFT
    'serum_creatinine': {'male': (0.7, 1.3), 'female': (0.6, 1.1), 'unit': 'mg/dL'},
    'blood_urea': {'male': (7, 20), 'female': (7, 20), 'unit': 'mg/dL'},
    'uric_acid': {'male': (3.4, 7.0), 'female': (2.4, 6.0), 'unit': 'mg/dL'},
    'sodium': {'male': (136, 145), 'female': (136, 145), 'unit': 'mEq/L'},
    'potassium': {'male': (3.5, 5.1), 'female': (3.5, 5.1), 'unit': 'mEq/L'},
    # Thyroid
    'tsh': {'male': (0.4, 4.0), 'female': (0.4, 4.0), 'unit': 'mIU/L'},
    't3': {'male': (80, 200), 'female': (80, 200), 'unit': 'ng/dL'},
    't4': {'male': (5.0, 12.0), 'female': (5.0, 12.0), 'unit': 'ug/dL'},
    'free_t3': {'male': (2.3, 4.2), 'female': (2.3, 4.2), 'unit': 'pg/mL'},
    'free_t4': {'male': (0.8, 1.8), 'female': (0.8, 1.8), 'unit': 'ng/dL'},
}

PARAMETER_PATTERNS = {
    'haemoglobin': r'h[ae]moglobin[:\s]+(\d+\.?\d*)',
    'wbc': r'(?:wbc|white\s*blood\s*cell)[:\s]+(\d+\.?\d*)',
    'platelets': r'platelet[:\s]+(\d+\.?\d*)',
    'rbc': r'(?:rbc|red\s*blood\s*cell)[:\s]+(\d+\.?\d*)',
    'hematocrit': r'hematocrit[:\s]+(\d+\.?\d*)',
    'fasting_glucose': r'fasting\s*(?:blood\s*)?(?:glucose|sugar)[:\s]+(\d+\.?\d*)',
    'postprandial_glucose': r'(?:postprandial|pp|post\s*meal)[:\s]+(\d+\.?\d*)',
    'hba1c': r'hb\s*a1c[:\s]+(\d+\.?\d*)',
    'total_cholesterol': r'total\s*cholesterol[:\s]+(\d+\.?\d*)',
    'ldl': r'ldl[:\s]+(\d+\.?\d*)',
    'hdl': r'hdl[:\s]+(\d+\.?\d*)',
    'triglycerides': r'triglycerides?[:\s]+(\d+\.?\d*)',
    'sgpt': r'(?:sgpt|alt)[:\s]+(\d+\.?\d*)',
    'sgot': r'(?:sgot|ast)[:\s]+(\d+\.?\d*)',
    'alkaline_phosphatase': r'alkaline\s*phospha(?:tase|se)[:\s]+(\d+\.?\d*)',
    'total_bilirubin': r'total\s*bilirubin[:\s]+(\d+\.?\d*)',
    'serum_creatinine': r'(?:serum\s*)?creatinine[:\s]+(\d+\.?\d*)',
    'blood_urea': r'(?:blood\s*)?urea[:\s]+(\d+\.?\d*)',
    'uric_acid': r'uric\s*acid[:\s]+(\d+\.?\d*)',
    'tsh': r'tsh[:\s]+(\d+\.?\d*)',
    't3': r'\bt3\b[:\s]+(\d+\.?\d*)',
    't4': r'\bt4\b[:\s]+(\d+\.?\d*)',
    'sodium': r'sodium[:\s]+(\d+\.?\d*)',
    'potassium': r'potassium[:\s]+(\d+\.?\d*)',
}

REPORT_TYPE_KEYWORDS = {
    'CBC': ['haemoglobin', 'wbc', 'platelets', 'rbc', 'hematocrit', 'complete blood count'],
    'sugar': ['glucose', 'hba1c', 'fasting', 'blood sugar'],
    'lipid': ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid profile'],
    'thyroid': ['tsh', 't3', 't4', 'thyroid'],
    'LFT': ['sgpt', 'sgot', 'bilirubin', 'liver function', 'alt', 'ast'],
    'KFT': ['creatinine', 'urea', 'uric acid', 'kidney function', 'renal'],
}

class ReportAnalyzer:
    def analyze(self, file_path=None, file_data_b64=None, report_type='unknown'):
        """Main analysis entry point"""
        try:
            # Extract text from PDF
            text = ''
            actual_path = file_path

            if file_data_b64 and not (file_path and os.path.exists(file_path or '')):
                # Write base64 to temp file
                tmp = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
                tmp.write(base64.b64decode(file_data_b64))
                tmp.close()
                actual_path = tmp.name

            if actual_path and os.path.exists(actual_path):
                text = self._extract_text(actual_path)
            else:
                text = 'Unable to read file.'

            # Detect report type
            detected_type = self._detect_report_type(text, report_type)

            # Extract parameters
            parameters = self._extract_parameters(text)

            # Classify values as normal/abnormal
            gender = 'male'  # Default; ideally passed in
            abnormal_values = self._classify_values(parameters, gender)

            # Generate summary and recommendations
            overall_status = self._calculate_overall_status(abnormal_values)
            predicted_risks = self._predict_risks(abnormal_values, detected_type)
            recommendations = self._generate_recommendations(abnormal_values, detected_type)
            summary = self._generate_summary(detected_type, parameters, abnormal_values, overall_status)

            # Determine urgency
            urgency = 'routine'
            if any(v['status'] == 'critical' for v in abnormal_values):
                urgency = 'emergency'
            elif len([v for v in abnormal_values if v['status'] in ['high', 'low']]) > 3:
                urgency = 'urgent'
            elif abnormal_values:
                urgency = 'soon'

            return {
                'extracted_text': text[:3000],  # Limit size
                'detected_type': detected_type,
                'parameters': parameters,
                'abnormal_values': abnormal_values,
                'overall_status': overall_status,
                'summary': summary,
                'predicted_risks': predicted_risks,
                'recommendations': recommendations,
                'urgency': urgency,
                'follow_up_required': len(abnormal_values) > 0,
                'lab_name': self._extract_lab_name(text),
                'patient_name': self._extract_patient_name(text),
                'report_date': self._extract_date(text)
            }

        except Exception as e:
            logger.error(f'Analysis error: {e}')
            return {
                'extracted_text': '',
                'detected_type': report_type,
                'parameters': [],
                'abnormal_values': [],
                'overall_status': 'unknown',
                'summary': f'Analysis failed: {str(e)}',
                'predicted_risks': [],
                'recommendations': ['Please re-upload the report or try a clearer scan.'],
                'urgency': 'routine',
                'follow_up_required': False
            }

    def _extract_text(self, file_path):
        """Extract text using pdfplumber, fallback to PyMuPDF"""
        text = ''
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + '\n'
        except Exception as e:
            logger.warning(f'pdfplumber failed: {e}, trying PyMuPDF')
            try:
                import fitz
                doc = fitz.open(file_path)
                for page in doc:
                    text += page.get_text() + '\n'
                doc.close()
            except Exception as e2:
                logger.error(f'PyMuPDF also failed: {e2}')
                text = 'Could not extract text from this PDF. Please ensure it is text-based, not scanned.'
        return text.strip()

    def _detect_report_type(self, text, provided_type):
        if provided_type and provided_type != 'unknown':
            return provided_type
        text_lower = text.lower()
        scores = {}
        for rtype, keywords in REPORT_TYPE_KEYWORDS.items():
            scores[rtype] = sum(1 for kw in keywords if kw in text_lower)
        if scores:
            best = max(scores, key=scores.get)
            if scores[best] > 0:
                return best
        return 'general_checkup'

    def _extract_parameters(self, text):
        """Extract numerical values from text"""
        text_lower = text.lower()
        params = []
        for param_name, pattern in PARAMETER_PATTERNS.items():
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                try:
                    value = float(matches[0])
                    nr = NORMAL_RANGES.get(param_name, {})
                    params.append({
                        'parameter': param_name.replace('_', ' ').title(),
                        'value': str(value),
                        'unit': nr.get('unit', ''),
                        'normalRange': f"{nr.get('male', ('?','?'))[0]} - {nr.get('male', ('?','?'))[1]}" if nr else 'N/A',
                        'status': 'normal'  # Will be updated by classify
                    })
                except ValueError:
                    pass
        return params

    def _classify_values(self, parameters, gender='male'):
        """Classify each parameter as normal, high, low, or critical"""
        abnormal = []
        for param in parameters:
            name_key = param['parameter'].lower().replace(' ', '_')
            nr = NORMAL_RANGES.get(name_key)
            if not nr:
                continue
            try:
                value = float(param['value'])
                low, high = nr.get(gender, nr.get('male', (None, None)))
                status = 'normal'
                severity = None
                if value < low:
                    diff_pct = (low - value) / low * 100
                    status = 'critical' if diff_pct > 30 else 'low'
                    severity = 'severe' if diff_pct > 30 else ('moderate' if diff_pct > 15 else 'mild')
                elif value > high:
                    diff_pct = (value - high) / high * 100
                    status = 'critical' if diff_pct > 50 else 'high'
                    severity = 'severe' if diff_pct > 50 else ('moderate' if diff_pct > 25 else 'mild')

                param['status'] = status
                if status != 'normal':
                    param['severity'] = severity
                    abnormal.append(param)
            except (ValueError, TypeError):
                pass
        return abnormal

    def _calculate_overall_status(self, abnormal_values):
        if not abnormal_values:
            return 'normal'
        if any(v['status'] == 'critical' for v in abnormal_values):
            return 'critical'
        if len(abnormal_values) > 3:
            return 'abnormal'
        return 'borderline'

    def _predict_risks(self, abnormal_values, report_type):
        risks = []
        names = [v['parameter'].lower() for v in abnormal_values]
        statuses = {v['parameter'].lower(): v['status'] for v in abnormal_values}

        if 'haemoglobin' in str(names) and statuses.get('haemoglobin') in ['low', 'critical']:
            risks.append('Anemia')
        if 'ldl' in str(names) and statuses.get('ldl') in ['high', 'critical']:
            risks.append('Cardiovascular Disease Risk')
        if 'total cholesterol' in str(names) and statuses.get('total cholesterol') in ['high', 'critical']:
            risks.append('High Cholesterol')
        if 'fasting glucose' in str(names) and statuses.get('fasting glucose') in ['high', 'critical']:
            risks.append('Diabetes / Pre-Diabetes')
        if 'tsh' in str(names):
            risks.append('Thyroid Dysfunction')
        if 'serum creatinine' in str(names) and statuses.get('serum creatinine') in ['high', 'critical']:
            risks.append('Kidney Function Impairment')
        if 'sgpt' in str(names) and statuses.get('sgpt') in ['high', 'critical']:
            risks.append('Liver Function Impairment')
        return risks

    def _generate_recommendations(self, abnormal_values, report_type):
        recs = []
        if not abnormal_values:
            return ['All parameters are within normal range. Maintain your healthy lifestyle!', 'Schedule your next routine checkup in 6-12 months.']
        for v in abnormal_values[:5]:  # Top 5 abnormal
            name = v['parameter']
            status = v['status']
            recs.append(f"Consult a doctor regarding your {name} level which is {status}.")
        recs.append('Do not self-medicate. Always seek professional medical advice.')
        recs.append('Repeat the test after treatment as recommended by your physician.')
        return recs

    def _generate_summary(self, report_type, parameters, abnormal_values, overall_status):
        n_params = len(parameters)
        n_abnormal = len(abnormal_values)
        if overall_status == 'normal':
            return f'Your {report_type} report shows all {n_params} tested parameters within normal limits. Your results look healthy!'
        elif overall_status == 'critical':
            critical = [v['parameter'] for v in abnormal_values if v['status'] == 'critical']
            return f'URGENT: Your {report_type} report has {n_abnormal} abnormal value(s), including critical levels in: {", ".join(critical)}. Seek immediate medical attention.'
        else:
            abn_names = [v['parameter'] for v in abnormal_values[:3]]
            return f'Your {report_type} report shows {n_abnormal} out of {n_params} parameters outside normal range, including: {", ".join(abn_names)}. Please consult your physician for further evaluation.'

    def _extract_lab_name(self, text):
        patterns = [r'(?:laboratory|lab|diagnostics|pathology)[:\s]*([A-Z][A-Za-z\s]+)', r'^([A-Z][A-Za-z\s]+(?:Lab|Diagnostics|Pathology|Hospital))']
        for p in patterns:
            m = re.search(p, text, re.IGNORECASE | re.MULTILINE)
            if m:
                return m.group(1).strip()[:50]
        return None

    def _extract_patient_name(self, text):
        patterns = [r'patient\s*(?:name)?[:\s]+([A-Za-z\s]+)', r'name[:\s]+([A-Za-z\s]{3,30})']
        for p in patterns:
            m = re.search(p, text, re.IGNORECASE)
            if m:
                return m.group(1).strip()
        return None

    def _extract_date(self, text):
        patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})'
        ]
        for p in patterns:
            m = re.search(p, text, re.IGNORECASE)
            if m:
                try:
                    from dateutil import parser
                    return parser.parse(m.group(1)).isoformat()
                except:
                    return None
        return None
