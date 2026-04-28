"""
Medical Report PDF Analyzer
Extracts text, detects parameters, compares normal ranges, identifies abnormal values
"""

import re
import os
import base64
import tempfile
from datetime import datetime

# ─── Normal Ranges Reference ─────────────────────────────────────────────────
NORMAL_RANGES = {
    # CBC (Complete Blood Count)
    'hemoglobin': {'min': 12.0, 'max': 17.5, 'unit': 'g/dL', 'low_label': 'Anemia suspected', 'high_label': 'Polycythemia'},
    'wbc': {'min': 4.5, 'max': 11.0, 'unit': '10³/µL', 'low_label': 'Leukopenia', 'high_label': 'Leukocytosis/Infection'},
    'rbc': {'min': 4.2, 'max': 5.9, 'unit': '10⁶/µL', 'low_label': 'Anemia', 'high_label': 'Polycythemia'},
    'platelets': {'min': 150, 'max': 400, 'unit': '10³/µL', 'low_label': 'Thrombocytopenia', 'high_label': 'Thrombocytosis'},
    'hematocrit': {'min': 36.0, 'max': 52.0, 'unit': '%', 'low_label': 'Low', 'high_label': 'High'},
    'mcv': {'min': 80, 'max': 100, 'unit': 'fL', 'low_label': 'Microcytic anemia', 'high_label': 'Macrocytic anemia'},
    'mch': {'min': 27, 'max': 33, 'unit': 'pg', 'low_label': 'Hypochromic', 'high_label': 'Hyperchromic'},
    'mchc': {'min': 31, 'max': 37, 'unit': 'g/dL', 'low_label': 'Low', 'high_label': 'High'},

    # Sugar/Glucose
    'fasting glucose': {'min': 70, 'max': 100, 'unit': 'mg/dL', 'low_label': 'Hypoglycemia', 'high_label': 'Hyperglycemia/Diabetes risk'},
    'fasting blood sugar': {'min': 70, 'max': 100, 'unit': 'mg/dL', 'low_label': 'Hypoglycemia', 'high_label': 'Diabetes risk'},
    'random blood sugar': {'min': 70, 'max': 140, 'unit': 'mg/dL', 'low_label': 'Hypoglycemia', 'high_label': 'Diabetes risk'},
    'hba1c': {'min': 4.0, 'max': 5.7, 'unit': '%', 'low_label': 'Low', 'high_label': 'Prediabetes/Diabetes'},
    'ppbs': {'min': 70, 'max': 140, 'unit': 'mg/dL', 'low_label': 'Low', 'high_label': 'Elevated post-meal glucose'},

    # Lipid Profile
    'total cholesterol': {'min': 0, 'max': 200, 'unit': 'mg/dL', 'low_label': 'Normal', 'high_label': 'Hypercholesterolemia'},
    'hdl cholesterol': {'min': 40, 'max': 999, 'unit': 'mg/dL', 'low_label': 'Low HDL (bad)', 'high_label': 'Normal/Good'},
    'ldl cholesterol': {'min': 0, 'max': 100, 'unit': 'mg/dL', 'low_label': 'Optimal', 'high_label': 'Elevated LDL'},
    'triglycerides': {'min': 0, 'max': 150, 'unit': 'mg/dL', 'low_label': 'Normal', 'high_label': 'Hypertriglyceridemia'},
    'vldl': {'min': 0, 'max': 30, 'unit': 'mg/dL', 'low_label': 'Normal', 'high_label': 'Elevated'},

    # Thyroid
    'tsh': {'min': 0.4, 'max': 4.0, 'unit': 'mIU/L', 'low_label': 'Hyperthyroidism suspected', 'high_label': 'Hypothyroidism suspected'},
    't3': {'min': 80, 'max': 200, 'unit': 'ng/dL', 'low_label': 'Low T3', 'high_label': 'Elevated T3'},
    't4': {'min': 5.0, 'max': 12.0, 'unit': 'µg/dL', 'low_label': 'Hypothyroidism', 'high_label': 'Hyperthyroidism'},
    'free t3': {'min': 2.0, 'max': 4.4, 'unit': 'pg/mL', 'low_label': 'Low', 'high_label': 'Elevated'},
    'free t4': {'min': 0.8, 'max': 1.8, 'unit': 'ng/dL', 'low_label': 'Low', 'high_label': 'Elevated'},

    # Liver Function (LFT)
    'sgpt': {'min': 7, 'max': 40, 'unit': 'U/L', 'low_label': 'Normal', 'high_label': 'Liver damage suspected'},
    'sgot': {'min': 10, 'max': 40, 'unit': 'U/L', 'low_label': 'Normal', 'high_label': 'Liver/Heart damage suspected'},
    'alt': {'min': 7, 'max': 40, 'unit': 'U/L', 'low_label': 'Normal', 'high_label': 'Liver damage'},
    'ast': {'min': 10, 'max': 40, 'unit': 'U/L', 'low_label': 'Normal', 'high_label': 'Liver/Heart damage'},
    'total bilirubin': {'min': 0.1, 'max': 1.2, 'unit': 'mg/dL', 'low_label': 'Normal', 'high_label': 'Jaundice/Liver issue'},
    'direct bilirubin': {'min': 0.0, 'max': 0.3, 'unit': 'mg/dL', 'low_label': 'Normal', 'high_label': 'Elevated'},
    'alkaline phosphatase': {'min': 44, 'max': 147, 'unit': 'U/L', 'low_label': 'Low', 'high_label': 'Liver/Bone disease'},
    'total protein': {'min': 6.0, 'max': 8.3, 'unit': 'g/dL', 'low_label': 'Low protein', 'high_label': 'Elevated'},
    'albumin': {'min': 3.5, 'max': 5.0, 'unit': 'g/dL', 'low_label': 'Hypoalbuminemia', 'high_label': 'Dehydration'},

    # Kidney Function (KFT)
    'creatinine': {'min': 0.6, 'max': 1.2, 'unit': 'mg/dL', 'low_label': 'Normal', 'high_label': 'Kidney dysfunction'},
    'blood urea nitrogen': {'min': 7, 'max': 20, 'unit': 'mg/dL', 'low_label': 'Low', 'high_label': 'Kidney/Liver issue'},
    'bun': {'min': 7, 'max': 20, 'unit': 'mg/dL', 'low_label': 'Low', 'high_label': 'Kidney issue'},
    'uric acid': {'min': 2.4, 'max': 7.0, 'unit': 'mg/dL', 'low_label': 'Low', 'high_label': 'Gout risk'},
    'sodium': {'min': 136, 'max': 145, 'unit': 'mEq/L', 'low_label': 'Hyponatremia', 'high_label': 'Hypernatremia'},
    'potassium': {'min': 3.5, 'max': 5.0, 'unit': 'mEq/L', 'low_label': 'Hypokalemia', 'high_label': 'Hyperkalemia'},

    # Blood Pressure
    'systolic bp': {'min': 90, 'max': 120, 'unit': 'mmHg', 'low_label': 'Hypotension', 'high_label': 'Hypertension'},
    'diastolic bp': {'min': 60, 'max': 80, 'unit': 'mmHg', 'low_label': 'Low', 'high_label': 'Hypertension'},
}

# ─── Report type detection patterns ──────────────────────────────────────────
REPORT_TYPE_PATTERNS = {
    'CBC': ['complete blood count', 'cbc', 'hemoglobin', 'wbc', 'rbc', 'platelets', 'hematocrit'],
    'sugar': ['blood sugar', 'glucose', 'hba1c', 'fasting blood sugar', 'ppbs', 'diabetes'],
    'lipid': ['lipid profile', 'cholesterol', 'triglyceride', 'hdl', 'ldl', 'vldl'],
    'thyroid': ['thyroid', 'tsh', 't3', 't4', 'thyroxine', 'triiodothyronine'],
    'LFT': ['liver function', 'lft', 'sgpt', 'sgot', 'bilirubin', 'alt', 'ast', 'alkaline phosphatase'],
    'KFT': ['kidney function', 'kft', 'creatinine', 'urea', 'bun', 'uric acid'],
    'ECG': ['ecg', 'electrocardiogram', 'ekg', 'cardiac rhythm', 'sinus rhythm'],
    'general_checkup': ['general', 'health checkup', 'annual', 'routine', 'physical examination']
}

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pdfplumber with PyMuPDF fallback."""
    text = ''
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n'
    except Exception as e:
        print(f"pdfplumber error: {e}, trying PyMuPDF...")
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text() + '\n'
            doc.close()
        except Exception as e2:
            print(f"PyMuPDF error: {e2}")

    return text.strip()

def detect_report_type(text: str) -> str:
    """Detect the type of medical report from text."""
    text_lower = text.lower()
    scores = {}
    for rtype, keywords in REPORT_TYPE_PATTERNS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[rtype] = score

    if max(scores.values()) == 0:
        return 'unknown'
    return max(scores, key=scores.get)

def extract_parameters(text: str) -> list:
    """Extract medical parameters and their values from text."""
    parameters = []

    # Pattern: "Parameter Name : value unit" or "Parameter Name value unit"
    patterns = [
        r'([A-Za-z][A-Za-z\s\(\)\/]+?)\s*[:]\s*(\d+\.?\d*)\s*([a-zA-Z\/µ%³⁶]*)',
        r'([A-Za-z][A-Za-z\s\(\)\/]+?)\s+(\d+\.?\d*)\s+([a-zA-Z\/µ%³⁶]+)',
    ]

    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            name = match.group(1).strip().lower()
            value_str = match.group(2).strip()
            unit = match.group(3).strip() if match.group(3) else ''

            # Skip very short names (likely not parameters)
            if len(name) < 3:
                continue

            try:
                value = float(value_str)
            except ValueError:
                continue

            # Check against known parameters
            matched_param = None
            for param_name in NORMAL_RANGES:
                if param_name in name or name in param_name:
                    matched_param = param_name
                    break

            if matched_param:
                normal = NORMAL_RANGES[matched_param]
                status = classify_value(value, normal['min'], normal['max'])
                severity = get_severity(value, normal['min'], normal['max'])

                parameters.append({
                    'parameter': match.group(1).strip(),
                    'value': str(value),
                    'unit': unit or normal.get('unit', ''),
                    'normalRange': f"{normal['min']} - {normal['max']} {normal.get('unit', '')}",
                    'status': status,
                    'severity': severity,
                    'interpretation': normal['high_label'] if status == 'high' else
                                      normal['low_label'] if status == 'low' else 'Normal'
                })

    # Deduplicate
    seen = set()
    unique_params = []
    for p in parameters:
        key = p['parameter'].lower()
        if key not in seen:
            seen.add(key)
            unique_params.append(p)

    return unique_params

def classify_value(value: float, min_val: float, max_val: float) -> str:
    if value < min_val:
        return 'low'
    elif value > max_val:
        return 'high'
    return 'normal'

def get_severity(value: float, min_val: float, max_val: float) -> str:
    range_size = max_val - min_val
    if range_size == 0:
        return 'mild'
    deviation = max(0, value - max_val) if value > max_val else max(0, min_val - value)
    pct = (deviation / range_size) * 100
    if pct < 20:
        return 'mild'
    elif pct < 50:
        return 'moderate'
    return 'severe'

def extract_metadata(text: str) -> dict:
    """Extract lab name, patient name, date from report text."""
    metadata = {}

    # Date patterns
    date_patterns = [
        r'(?:date|dated?|report date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
        r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})'
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            metadata['report_date'] = match.group(1)
            break

    # Patient name
    name_match = re.search(
        r'(?:patient|name|patient name)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        text, re.IGNORECASE
    )
    if name_match:
        metadata['patient_name'] = name_match.group(1)

    # Lab name (usually at top)
    lines = text.strip().split('\n')
    if lines:
        metadata['lab_name'] = lines[0].strip()[:100]

    return metadata

def generate_report_summary(parameters: list, report_type: str) -> dict:
    """Generate analysis summary from extracted parameters."""
    abnormal = [p for p in parameters if p['status'] != 'normal']
    critical = [p for p in abnormal if p.get('severity') == 'severe']
    moderate = [p for p in abnormal if p.get('severity') == 'moderate']

    # Determine overall status
    if critical:
        overall_status = 'critical'
    elif len(abnormal) >= 3 or moderate:
        overall_status = 'abnormal'
    elif abnormal:
        overall_status = 'borderline'
    else:
        overall_status = 'normal'

    # Predict risks
    predicted_risks = []
    for p in abnormal:
        risk = p.get('interpretation', '')
        if risk and risk not in predicted_risks:
            predicted_risks.append(risk)

    # Recommendations
    recommendations = []
    if critical:
        recommendations.append('⚠️ Seek immediate medical attention for critically abnormal values')
    if overall_status in ['critical', 'abnormal']:
        recommendations.append('Consult your doctor with this report as soon as possible')
    if report_type == 'CBC':
        low_hgb = [p for p in parameters if 'hemoglobin' in p['parameter'].lower() and p['status'] == 'low']
        if low_hgb:
            recommendations.extend(['Iron-rich foods: spinach, lentils, red meat', 'Vitamin C enhances iron absorption'])
    if report_type in ['lipid', 'sugar']:
        recommendations.extend(['Regular monitoring advised', 'Dietary and lifestyle modifications recommended'])

    if not recommendations:
        recommendations = ['Continue regular health monitoring', 'Maintain current healthy lifestyle', 'Schedule annual checkups']

    # Generate summary text
    if overall_status == 'normal':
        summary = f'Your {report_type.upper()} report shows all parameters within normal ranges. Great health indicators!'
    elif overall_status == 'borderline':
        params_str = ', '.join([p['parameter'] for p in abnormal[:3]])
        summary = f'Your report shows {len(abnormal)} parameter(s) slightly outside normal range: {params_str}. Monitor and follow up.'
    elif overall_status == 'abnormal':
        params_str = ', '.join([p['parameter'] for p in abnormal[:3]])
        summary = f'Several abnormal values detected: {params_str}. {len(abnormal)} total parameters require attention. Please consult your doctor.'
    else:
        summary = f'Critical values detected in {len(critical)} parameter(s). Immediate medical consultation strongly recommended.'

    urgency_map = {'normal': 'routine', 'borderline': 'soon', 'abnormal': 'soon', 'critical': 'urgent'}

    return {
        'summary': summary,
        'overall_status': overall_status,
        'predicted_risks': predicted_risks[:5],
        'recommendations': recommendations[:6],
        'urgency': urgency_map.get(overall_status, 'routine'),
        'follow_up_required': overall_status != 'normal'
    }

def analyze_report(file_path: str = None, file_data: str = None, report_type: str = 'unknown') -> dict:
    """Main function: analyze a medical report PDF."""
    tmp_path = None
    try:
        # Save base64 file to temp if needed
        if file_data and not file_path:
            file_bytes = base64.b64decode(file_data)
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            tmp.write(file_bytes)
            tmp.close()
            tmp_path = tmp.name
            file_path = tmp_path

        if not file_path or not os.path.exists(file_path):
            return {'error': 'File not found', 'extracted_text': '', 'parameters': []}

        # Extract text
        extracted_text = extract_text_from_pdf(file_path)

        if not extracted_text:
            return {
                'extracted_text': '',
                'parameters': [],
                'abnormal_values': [],
                'detected_type': report_type,
                'summary': 'Could not extract text from the PDF. Please ensure it is a text-based PDF.',
                'overall_status': 'unknown',
                'predicted_risks': [],
                'recommendations': ['Re-upload a clear, text-based PDF report'],
                'urgency': 'routine',
                'follow_up_required': False
            }

        # Detect report type if not provided
        detected_type = report_type if report_type != 'unknown' else detect_report_type(extracted_text)

        # Extract parameters
        parameters = extract_parameters(extracted_text)
        abnormal_values = [p for p in parameters if p['status'] != 'normal']

        # Extract metadata
        metadata = extract_metadata(extracted_text)

        # Generate analysis
        analysis = generate_report_summary(parameters, detected_type)

        return {
            'extracted_text': extracted_text[:5000],  # Limit text size
            'detected_type': detected_type,
            'parameters': parameters,
            'abnormal_values': abnormal_values,
            'lab_name': metadata.get('lab_name', ''),
            'patient_name': metadata.get('patient_name', ''),
            'report_date': metadata.get('report_date', ''),
            **analysis
        }

    except Exception as e:
        print(f"Report analysis error: {e}")
        import traceback; traceback.print_exc()
        return {
            'error': str(e),
            'extracted_text': '',
            'parameters': [],
            'abnormal_values': [],
            'detected_type': report_type,
            'summary': 'Analysis failed. Please try again.',
            'overall_status': 'unknown',
            'predicted_risks': [],
            'recommendations': [],
            'urgency': 'routine',
            'follow_up_required': False
        }
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
