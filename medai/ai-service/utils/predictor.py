"""
Disease Predictor
Loads trained models and returns detailed prediction results
"""

import os
import json
import joblib
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

# ─── Model Registry ───────────────────────────────────────────────────────────
MODEL_CONFIGS = {
    'diabetes': {
        'features': ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness',
                     'insulin', 'bmi', 'diabetes_pedigree', 'age'],
        'specialists': ['Endocrinologist', 'Diabetologist'],
        'display_name': 'Diabetes'
    },
    'heart_disease': {
        'features': ['age', 'sex', 'chest_pain_type', 'resting_bp', 'cholesterol',
                     'fasting_blood_sugar', 'resting_ecg', 'max_heart_rate',
                     'exercise_angina', 'st_depression', 'st_slope'],
        'specialists': ['Cardiologist', 'Cardiac Surgeon'],
        'display_name': 'Heart Disease'
    },
    'bp_risk': {
        'features': ['age', 'gender', 'height', 'weight', 'bmi', 'smoking',
                     'alcohol', 'physical_activity', 'salt_intake', 'stress_level'],
        'specialists': ['Cardiologist', 'General Physician'],
        'display_name': 'Blood Pressure Risk'
    },
    'kidney_disease': {
        'features': ['age', 'blood_pressure', 'specific_gravity', 'albumin', 'sugar',
                     'rbc', 'pus_cell', 'bacteria', 'blood_glucose', 'blood_urea',
                     'serum_creatinine', 'sodium', 'potassium', 'hemoglobin'],
        'specialists': ['Nephrologist', 'Urologist'],
        'display_name': 'Kidney Disease'
    },
    'liver_disease': {
        'features': ['age', 'gender', 'total_bilirubin', 'direct_bilirubin',
                     'alkaline_phosphotase', 'alamine_aminotransferase',
                     'aspartate_aminotransferase', 'total_proteins', 'albumin',
                     'albumin_globulin_ratio'],
        'specialists': ['Hepatologist', 'Gastroenterologist'],
        'display_name': 'Liver Disease'
    },
    'thyroid': {
        'features': ['age', 'sex', 'on_thyroxine', 'tsh', 't3', 'tt4', 't4u', 'fti'],
        'specialists': ['Endocrinologist', 'Thyroid Specialist'],
        'display_name': 'Thyroid Disorder'
    },
    'anemia': {
        'features': ['gender', 'hemoglobin', 'mch', 'mchc', 'mcv'],
        'specialists': ['Hematologist', 'General Physician'],
        'display_name': 'Anemia'
    },
    'cholesterol': {
        'features': ['age', 'gender', 'total_cholesterol', 'hdl', 'ldl', 'triglycerides',
                     'bmi', 'smoking', 'diabetes', 'hypertension'],
        'specialists': ['Cardiologist', 'Lipidologist'],
        'display_name': 'High Cholesterol'
    },
    'obesity': {
        'features': ['age', 'gender', 'height', 'weight', 'bmi', 'physical_activity',
                     'fruit_vegetable_intake', 'fast_food_freq', 'water_intake',
                     'family_history'],
        'specialists': ['Dietitian', 'Bariatric Specialist'],
        'display_name': 'Obesity Risk'
    },
    'stroke': {
        'features': ['age', 'hypertension', 'heart_disease', 'ever_married',
                     'work_type', 'residence_type', 'avg_glucose_level',
                     'bmi', 'smoking_status'],
        'specialists': ['Neurologist', 'Stroke Specialist'],
        'display_name': 'Stroke Risk'
    },
    'stress': {
        'features': ['sleep_quality', 'work_hours', 'physical_activity', 'social_support',
                     'anxiety_level', 'mood_swings', 'concentration', 'fatigue'],
        'specialists': ['Psychiatrist', 'Psychologist'],
        'display_name': 'Stress Level'
    },
    'depression': {
        'features': ['sadness', 'euphoric', 'exhausted', 'sleep_disorder', 'mood_swings',
                     'suicidal_thoughts', 'anorexia', 'authority_respect',
                     'try_explanation', 'aggressive_response', 'ignore_move_on',
                     'nervous_break_down', 'admit_mistakes', 'overthinking'],
        'specialists': ['Psychiatrist', 'Clinical Psychologist'],
        'display_name': 'Depression'
    },
    'pcos': {
        'features': ['age', 'bmi', 'cycle_length', 'marriage_status', 'pregnant',
                     'abortions', 'fsh', 'lh', 'hip', 'waist', 'weight_gain',
                     'hair_growth', 'skin_darkening', 'hair_loss', 'pimples',
                     'fast_food', 'reg_exercise'],
        'specialists': ['Gynecologist', 'Endocrinologist'],
        'display_name': 'PCOS'
    },
    'arthritis': {
        'features': ['age', 'gender', 'bmi', 'joint_pain', 'stiffness', 'swelling',
                     'family_history', 'physical_activity', 'smoking', 'previous_injury'],
        'specialists': ['Rheumatologist', 'Orthopedic Surgeon'],
        'display_name': 'Arthritis'
    },
    'general_health': {
        'features': ['age', 'bmi', 'blood_pressure_systolic', 'blood_pressure_diastolic',
                     'fasting_glucose', 'cholesterol', 'smoking', 'alcohol',
                     'physical_activity', 'sleep_hours', 'stress_level', 'diet_quality'],
        'specialists': ['General Physician', 'Preventive Medicine Specialist'],
        'display_name': 'General Health Score'
    }
}

# ─── Disease-specific advice ──────────────────────────────────────────────────
DISEASE_ADVICE = {
    'diabetes': {
        'low': {
            'prevention': ['Maintain healthy weight', 'Exercise 30 min/day', 'Limit sugary drinks', 'Annual glucose screening'],
            'diet': ['Whole grains', 'Leafy greens', 'Lean protein', 'Limit refined carbs', 'Low glycemic index foods'],
            'exercise': ['Brisk walking 30 min daily', 'Swimming 3x/week', 'Cycling', 'Resistance training'],
            'advice': 'Your diabetes risk is low. Continue maintaining a healthy lifestyle.'
        },
        'moderate': {
            'prevention': ['Monitor blood sugar regularly', 'Reduce sugar and refined carbs', 'Lose 5-7% body weight if overweight', 'Consult doctor for glucose tolerance test'],
            'diet': ['Strictly limit sugar', 'Increase fiber intake', 'Choose low GI foods', 'Portion control', 'Avoid fruit juices'],
            'exercise': ['Daily 45 min moderate exercise', 'Post-meal walks', 'Yoga for stress reduction', 'Strength training 2x/week'],
            'advice': 'You have moderate diabetes risk. Lifestyle changes now can prevent progression. Schedule a glucose tolerance test.'
        },
        'high': {
            'prevention': ['Immediate medical consultation', 'Daily blood sugar monitoring', 'Strict dietary changes', 'Medication may be required'],
            'diet': ['Diabetic meal plan', 'No sugary foods or drinks', 'Small frequent meals', 'Count carbohydrates', 'High fiber diet'],
            'exercise': ['Daily structured exercise program', 'Monitor glucose before/after exercise', 'Low-impact activities', 'Consult physio before starting'],
            'advice': 'High diabetes risk detected. Please consult an endocrinologist immediately. Do not ignore this result.'
        }
    },
    'heart_disease': {
        'low': {
            'prevention': ['Annual cardiac checkup', 'Maintain healthy BP', 'No smoking', 'Stress management'],
            'diet': ['Mediterranean diet', 'Omega-3 rich foods', 'Reduce sodium', 'Limit saturated fats'],
            'exercise': ['Aerobic exercise 150 min/week', 'Avoid sedentary lifestyle'],
            'advice': 'Low heart disease risk. Keep up the healthy habits!'
        },
        'moderate': {
            'prevention': ['Monitor blood pressure weekly', 'Check cholesterol every 6 months', 'Quit smoking', 'Limit alcohol'],
            'diet': ['Low sodium diet', 'Reduce red meat', 'More fish', 'Nuts and seeds', 'Avoid trans fats'],
            'exercise': ['Cardio exercise 30 min/day', 'Heart rate monitoring during exercise', 'No intense sudden exercise'],
            'advice': 'Moderate cardiac risk. Consult a cardiologist for preventive measures and ECG evaluation.'
        },
        'high': {
            'prevention': ['Urgent cardiologist consultation', 'Stress test required', 'Medication evaluation', 'Regular ECG monitoring'],
            'diet': ['Strict cardiac diet', 'No salt added', 'No fried/processed foods', 'Cardiac dietitian recommended'],
            'exercise': ['Only medically supervised exercise', 'Cardiac rehab program', 'Avoid strenuous activity'],
            'advice': 'HIGH cardiac risk. Please seek immediate cardiology evaluation. This may require medication or intervention.'
        }
    }
}

def get_risk_level(probability: float) -> str:
    if probability < 25:
        return 'Low'
    elif probability < 55:
        return 'Moderate'
    elif probability < 80:
        return 'High'
    else:
        return 'Critical'

def get_urgency(risk_level: str) -> str:
    mapping = {'Low': 'routine', 'Moderate': 'soon', 'High': 'urgent', 'Critical': 'emergency'}
    return mapping.get(risk_level, 'routine')

def get_advice_for_disease(disease_type: str, risk_level: str, input_data: dict) -> dict:
    """Generate detailed advice based on disease type and risk level."""
    risk_key = risk_level.lower() if risk_level.lower() in ['low', 'moderate', 'high', 'critical'] else 'moderate'
    if risk_key == 'critical':
        risk_key = 'high'

    base_advice = DISEASE_ADVICE.get(disease_type, {}).get(risk_key, {})

    # Generic fallback
    if not base_advice:
        base_advice = {
            'prevention': [
                'Regular medical checkups every 6 months',
                'Maintain healthy BMI (18.5-24.9)',
                'Exercise at least 150 minutes per week',
                'Reduce stress through meditation or yoga',
                'Avoid smoking and limit alcohol',
                'Get adequate sleep (7-9 hours/night)'
            ],
            'diet': [
                'Eat more fruits and vegetables (5+ servings/day)',
                'Choose whole grains over refined grains',
                'Include lean protein sources',
                'Limit processed and fast foods',
                'Stay hydrated (8+ glasses of water daily)',
                'Reduce sugar and salt intake'
            ],
            'exercise': [
                '30 minutes brisk walking 5 days a week',
                'Strength training 2-3 times per week',
                'Yoga or stretching for flexibility',
                'Take stairs instead of elevator',
                'Active breaks every 30 minutes if desk job'
            ],
            'advice': f'Based on your inputs, please consult a healthcare professional for a comprehensive evaluation.'
        }

    # Generate reasons based on inputs
    reasons = generate_reasons(disease_type, input_data, risk_level)

    return {
        'prevention': base_advice.get('prevention', []),
        'diet_plan': base_advice.get('diet', []),
        'exercise_tips': base_advice.get('exercise', []),
        'doctor_advice': base_advice.get('advice', ''),
        'reasons': reasons
    }

def generate_reasons(disease_type: str, input_data: dict, risk_level: str) -> list:
    """Generate human-readable reasons for the prediction."""
    reasons = []

    # Common checks
    age = input_data.get('age', 0)
    bmi = input_data.get('bmi', 0)
    glucose = input_data.get('glucose', input_data.get('blood_glucose', 0))

    if age and int(age) > 45:
        reasons.append(f'Age {age} is a risk factor (risk increases after 45)')
    if bmi and float(bmi) > 25:
        reasons.append(f'BMI {bmi} indicates overweight/obesity (normal: 18.5-24.9)')
    if glucose and float(glucose) > 100:
        reasons.append(f'Blood glucose {glucose} mg/dL is elevated (normal fasting: <100)')

    bp = input_data.get('blood_pressure', input_data.get('resting_bp', 0))
    if bp and float(bp) > 130:
        reasons.append(f'Blood pressure {bp} mmHg is elevated (normal: <120/80)')

    cholesterol = input_data.get('cholesterol', input_data.get('total_cholesterol', 0))
    if cholesterol and float(cholesterol) > 200:
        reasons.append(f'Cholesterol {cholesterol} mg/dL is borderline high (normal: <200)')

    smoking = input_data.get('smoking', 0)
    if smoking and int(smoking) == 1:
        reasons.append('Smoking significantly increases cardiovascular risk')

    if not reasons:
        reasons = [
            'Multiple input parameters indicate elevated risk',
            'AI model detected patterns associated with higher risk',
            f'Overall risk assessment: {risk_level}'
        ]

    return reasons

def predict_disease(disease_type: str, input_data: dict) -> dict:
    """
    Main prediction function.
    Tries to load saved model; falls back to rule-based prediction.
    """
    config = MODEL_CONFIGS.get(disease_type)
    if not config:
        return {'error': f'Unknown disease type: {disease_type}'}

    probability = 0.0
    prediction = False
    confidence = 0.75

    # ── Try loading trained model ──────────────────────────────────────────────
    model_path = os.path.join(MODELS_DIR, f'{disease_type}_model.pkl')
    scaler_path = os.path.join(MODELS_DIR, f'{disease_type}_scaler.pkl')

    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            features = config['features']
            feature_values = []

            for feat in features:
                val = input_data.get(feat, 0)
                try:
                    feature_values.append(float(val))
                except (ValueError, TypeError):
                    # Handle categorical encoding
                    feature_values.append(encode_categorical(feat, val))

            X = np.array(feature_values).reshape(1, -1)

            # Scale if scaler exists
            if os.path.exists(scaler_path):
                scaler = joblib.load(scaler_path)
                X = scaler.transform(X)

            # Get prediction probability
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(X)[0]
                probability = float(proba[1]) * 100
                prediction = probability > 50
                confidence = float(max(proba))
            else:
                pred = model.predict(X)[0]
                prediction = bool(pred)
                probability = 75.0 if prediction else 25.0
                confidence = 0.8

        except Exception as e:
            print(f"Model load/predict error for {disease_type}: {e}")
            probability, prediction, confidence = rule_based_prediction(disease_type, input_data)
    else:
        # Fallback: rule-based
        probability, prediction, confidence = rule_based_prediction(disease_type, input_data)

    risk_level = get_risk_level(probability)
    urgency = get_urgency(risk_level)
    advice = get_advice_for_disease(disease_type, risk_level, input_data)

    return {
        'disease_type': disease_type,
        'display_name': config['display_name'],
        'prediction': prediction,
        'probability': round(probability, 2),
        'confidence': round(confidence, 3),
        'risk_level': risk_level,
        'urgency': urgency,
        'specialists': config['specialists'],
        'reasons': advice['reasons'],
        'prevention': advice['prevention'],
        'diet_plan': advice['diet_plan'],
        'exercise_tips': advice['exercise_tips'],
        'doctor_advice': advice['doctor_advice']
    }

def encode_categorical(feature: str, value) -> float:
    """Encode common categorical features to numeric."""
    categorical_maps = {
        'sex': {'male': 1, 'female': 0, 'm': 1, 'f': 0, '1': 1, '0': 0},
        'gender': {'male': 1, 'female': 0, 'm': 1, 'f': 0, '1': 1, '0': 0},
        'smoking': {'yes': 1, 'no': 0, 'true': 1, 'false': 0, '1': 1, '0': 0},
        'alcohol': {'yes': 1, 'no': 0, '1': 1, '0': 0},
        'ever_married': {'yes': 1, 'no': 0},
        'work_type': {'private': 0, 'self-employed': 1, 'govt_job': 2, 'children': 3, 'never_worked': 4},
        'residence_type': {'urban': 1, 'rural': 0},
        'smoking_status': {'never smoked': 0, 'formerly smoked': 1, 'smokes': 2, 'unknown': 3}
    }
    mapping = categorical_maps.get(feature.lower(), {})
    if isinstance(value, str):
        return float(mapping.get(value.lower(), 0))
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def rule_based_prediction(disease_type: str, input_data: dict) -> tuple:
    """
    Simple rule-based fallback when no trained model is available.
    Returns (probability, prediction, confidence)
    """
    risk_score = 0
    factors = 0

    # Age factor
    age = float(input_data.get('age', 30))
    if age > 60: risk_score += 25; factors += 1
    elif age > 45: risk_score += 15; factors += 1
    elif age > 35: risk_score += 8; factors += 1

    # BMI factor
    bmi = float(input_data.get('bmi', 22))
    if bmi > 35: risk_score += 25; factors += 1
    elif bmi > 30: risk_score += 20; factors += 1
    elif bmi > 25: risk_score += 10; factors += 1

    # Blood glucose
    glucose = float(input_data.get('glucose', input_data.get('blood_glucose', 90)))
    if glucose > 200: risk_score += 30; factors += 1
    elif glucose > 125: risk_score += 20; factors += 1
    elif glucose > 100: risk_score += 10; factors += 1

    # Blood pressure
    bp = float(input_data.get('blood_pressure', input_data.get('resting_bp', 80)))
    if bp > 160: risk_score += 25; factors += 1
    elif bp > 140: risk_score += 18; factors += 1
    elif bp > 130: risk_score += 10; factors += 1

    # Smoking
    smoking = input_data.get('smoking', 0)
    if str(smoking) in ['1', 'yes', 'true']: risk_score += 20; factors += 1

    # Calculate probability
    if factors > 0:
        probability = min(95, risk_score)
    else:
        probability = 30.0  # Base probability

    prediction = probability > 50
    confidence = 0.65  # Lower confidence for rule-based

    return probability, prediction, confidence
