"""
Train All Disease Prediction Models
Generates synthetic training data and trains RandomForest + XGBoost models
Run: python training/train_all_models.py
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline

# Try importing XGBoost (optional)
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("XGBoost not available. Using GradientBoosting instead.")

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

np.random.seed(42)
N = 3000  # Samples per disease

def save_model(model, scaler, disease_name):
    """Save trained model and scaler."""
    joblib.dump(model, os.path.join(MODELS_DIR, f'{disease_name}_model.pkl'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, f'{disease_name}_scaler.pkl'))
    print(f"  ✅ Saved {disease_name} model")

def train_model(X, y, disease_name):
    """Train and evaluate a model."""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    if HAS_XGB:
        model = XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                               use_label_encoder=False, eval_metric='logloss', random_state=42)
    else:
        model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)

    model.fit(X_train_s, y_train)
    y_pred = model.predict(X_test_s)
    acc = accuracy_score(y_test, y_pred)
    print(f"  📊 {disease_name}: Accuracy = {acc:.4f} ({int(acc*100)}%)")
    save_model(model, scaler, disease_name)
    return acc

# ─────────────────────────────────────────────────────────────────────────────
print("\n🏋️ Training MedAI Disease Prediction Models...")
print("=" * 55)

# 1. DIABETES
print("\n1. 🩸 Diabetes Model")
def gen_diabetes():
    glucose = np.random.normal(130, 40, N).clip(50, 300)
    bmi = np.random.normal(28, 6, N).clip(15, 55)
    age = np.random.normal(45, 15, N).clip(20, 80)
    insulin = np.random.normal(120, 100, N).clip(0, 500)
    bp = np.random.normal(80, 15, N).clip(40, 130)
    skin = np.random.normal(25, 12, N).clip(0, 60)
    dpf = np.random.exponential(0.5, N).clip(0.07, 2.5)
    preg = np.random.randint(0, 15, N).astype(float)
    risk = (
        (glucose > 140) * 0.35 + (bmi > 30) * 0.25 +
        (age > 50) * 0.15 + (insulin > 150) * 0.1 +
        (dpf > 0.5) * 0.1 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.4).astype(int)
    X = np.column_stack([preg, glucose, bp, skin, insulin, bmi, dpf, age])
    return X, y
X, y = gen_diabetes()
train_model(X, y, 'diabetes')

# 2. HEART DISEASE
print("\n2. ❤️ Heart Disease Model")
def gen_heart():
    age = np.random.normal(55, 12, N).clip(25, 80)
    sex = np.random.binomial(1, 0.67, N).astype(float)
    cp = np.random.randint(0, 4, N).astype(float)
    trestbps = np.random.normal(135, 20, N).clip(90, 200)
    chol = np.random.normal(240, 55, N).clip(120, 400)
    fbs = (trestbps > 120).astype(float)
    restecg = np.random.randint(0, 3, N).astype(float)
    thalach = np.random.normal(150, 25, N).clip(70, 200)
    exang = np.random.binomial(1, 0.3, N).astype(float)
    oldpeak = np.random.exponential(1.2, N).clip(0, 6)
    slope = np.random.randint(0, 3, N).astype(float)
    risk = (
        (age > 60) * 0.2 + (sex == 1) * 0.15 + (cp > 1) * 0.2 +
        (trestbps > 150) * 0.15 + (chol > 280) * 0.15 +
        (exang == 1) * 0.1 + (oldpeak > 2) * 0.1 +
        np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.35).astype(int)
    X = np.column_stack([age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope])
    return X, y
X, y = gen_heart()
train_model(X, y, 'heart_disease')

# 3. BP RISK
print("\n3. 🫁 Blood Pressure Risk Model")
def gen_bp():
    age = np.random.normal(45, 15, N).clip(18, 80)
    gender = np.random.binomial(1, 0.5, N).astype(float)
    height = np.random.normal(165, 10, N).clip(145, 200)
    weight = np.random.normal(72, 18, N).clip(40, 150)
    bmi = weight / (height/100)**2
    smoking = np.random.binomial(1, 0.25, N).astype(float)
    alcohol = np.random.binomial(1, 0.3, N).astype(float)
    activity = np.random.randint(0, 5, N).astype(float)
    salt = np.random.randint(0, 5, N).astype(float)
    stress = np.random.randint(0, 10, N).astype(float)
    risk = (
        (age > 50) * 0.2 + (bmi > 28) * 0.2 + (smoking == 1) * 0.15 +
        (salt > 3) * 0.15 + (stress > 6) * 0.15 + (activity < 2) * 0.1 +
        (alcohol == 1) * 0.05 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.35).astype(int)
    X = np.column_stack([age, gender, height, weight, bmi, smoking, alcohol, activity, salt, stress])
    return X, y
X, y = gen_bp()
train_model(X, y, 'bp_risk')

# 4. KIDNEY DISEASE
print("\n4. 🫘 Kidney Disease Model")
def gen_kidney():
    age = np.random.normal(50, 16, N).clip(18, 90)
    bp = np.random.normal(85, 20, N).clip(50, 180)
    sg = np.random.choice([1.005, 1.010, 1.015, 1.020, 1.025], N)
    albumin = np.random.randint(0, 6, N).astype(float)
    sugar = np.random.randint(0, 6, N).astype(float)
    rbc = np.random.binomial(1, 0.3, N).astype(float)
    pus_cell = np.random.binomial(1, 0.3, N).astype(float)
    bacteria = np.random.binomial(1, 0.1, N).astype(float)
    bg = np.random.normal(120, 50, N).clip(60, 400)
    urea = np.random.normal(40, 25, N).clip(10, 200)
    creatinine = np.random.exponential(1.2, N).clip(0.4, 10)
    sodium = np.random.normal(138, 8, N).clip(110, 160)
    potassium = np.random.normal(4.5, 1.2, N).clip(2.5, 7)
    hgb = np.random.normal(13, 3, N).clip(5, 18)
    risk = (
        (creatinine > 2) * 0.25 + (albumin > 2) * 0.2 + (urea > 60) * 0.15 +
        (bp > 100) * 0.1 + (age > 60) * 0.1 + (hgb < 10) * 0.1 +
        np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.3).astype(int)
    X = np.column_stack([age, bp, sg, albumin, sugar, rbc, pus_cell, bacteria, bg, urea, creatinine, sodium, potassium, hgb])
    return X, y
X, y = gen_kidney()
train_model(X, y, 'kidney_disease')

# 5. LIVER DISEASE
print("\n5. 🫀 Liver Disease Model")
def gen_liver():
    age = np.random.normal(45, 15, N).clip(18, 80)
    gender = np.random.binomial(1, 0.6, N).astype(float)
    tb = np.random.exponential(1.0, N).clip(0.1, 10)
    db = tb * np.random.uniform(0.2, 0.5, N)
    alkphos = np.random.normal(220, 120, N).clip(60, 800)
    alamine = np.random.normal(45, 50, N).clip(5, 400)
    aspartate = np.random.normal(50, 55, N).clip(5, 400)
    tp = np.random.normal(6.8, 1.0, N).clip(4, 9)
    albumin = np.random.normal(3.5, 0.7, N).clip(1, 5.5)
    ag_ratio = albumin / (tp - albumin + 0.01)
    risk = (
        (tb > 2) * 0.2 + (alamine > 80) * 0.2 + (aspartate > 80) * 0.2 +
        (alkphos > 300) * 0.15 + (albumin < 3) * 0.15 + (age > 55) * 0.1 +
        np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.35).astype(int)
    X = np.column_stack([age, gender, tb, db, alkphos, alamine, aspartate, tp, albumin, ag_ratio])
    return X, y
X, y = gen_liver()
train_model(X, y, 'liver_disease')

# 6. THYROID
print("\n6. 🦋 Thyroid Model")
def gen_thyroid():
    age = np.random.normal(42, 15, N).clip(18, 80)
    sex = np.random.binomial(1, 0.7, N).astype(float)
    on_thyroxine = np.random.binomial(1, 0.15, N).astype(float)
    tsh = np.abs(np.random.normal(3.5, 5, N)).clip(0.01, 50)
    t3 = np.random.normal(130, 40, N).clip(40, 250)
    tt4 = np.random.normal(115, 35, N).clip(40, 250)
    t4u = np.random.normal(0.95, 0.15, N).clip(0.5, 1.5)
    fti = tt4 / t4u
    risk = (
        (tsh > 5) * 0.3 + (tsh < 0.3) * 0.3 + (t3 < 80) * 0.15 +
        (tt4 < 70) * 0.15 + (sex == 1) * 0.05 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.3).astype(int)
    X = np.column_stack([age, sex, on_thyroxine, tsh, t3, tt4, t4u, fti])
    return X, y
X, y = gen_thyroid()
train_model(X, y, 'thyroid')

# 7. ANEMIA
print("\n7. 🔬 Anemia Model")
def gen_anemia():
    gender = np.random.binomial(1, 0.6, N).astype(float)
    hgb_min = np.where(gender == 1, 12.0, 13.5)
    hgb = np.random.normal(13, 2.5, N).clip(5, 18)
    mch = np.random.normal(29, 5, N).clip(15, 40)
    mchc = np.random.normal(33, 3, N).clip(24, 40)
    mcv = np.random.normal(88, 12, N).clip(60, 110)
    risk = (hgb < hgb_min).astype(float) * 0.6 + (mcv < 80) * 0.2 + (mch < 27) * 0.2 + np.random.normal(0, 0.05, N)
    y = (risk > 0.3).astype(int)
    X = np.column_stack([gender, hgb, mch, mchc, mcv])
    return X, y
X, y = gen_anemia()
train_model(X, y, 'anemia')

# 8. CHOLESTEROL
print("\n8. 💊 Cholesterol Model")
def gen_cholesterol():
    age = np.random.normal(48, 14, N).clip(18, 80)
    gender = np.random.binomial(1, 0.5, N).astype(float)
    total = np.random.normal(215, 50, N).clip(100, 400)
    hdl = np.random.normal(52, 14, N).clip(20, 100)
    ldl = total - hdl - np.random.normal(35, 10, N).clip(10, 60)
    trig = np.random.normal(160, 80, N).clip(50, 500)
    bmi = np.random.normal(27, 5, N).clip(16, 45)
    smoking = np.random.binomial(1, 0.25, N).astype(float)
    diabetes = np.random.binomial(1, 0.12, N).astype(float)
    htn = np.random.binomial(1, 0.3, N).astype(float)
    risk = (
        (total > 240) * 0.25 + (ldl > 160) * 0.25 + (hdl < 40) * 0.2 +
        (trig > 200) * 0.1 + (bmi > 30) * 0.1 + (smoking == 1) * 0.05 +
        (diabetes == 1) * 0.05 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.3).astype(int)
    X = np.column_stack([age, gender, total, hdl, ldl, trig, bmi, smoking, diabetes, htn])
    return X, y
X, y = gen_cholesterol()
train_model(X, y, 'cholesterol')

# 9. OBESITY
print("\n9. ⚖️ Obesity Model")
def gen_obesity():
    age = np.random.normal(38, 14, N).clip(18, 75)
    gender = np.random.binomial(1, 0.5, N).astype(float)
    height = np.random.normal(167, 11, N).clip(145, 205)
    weight = np.random.normal(75, 22, N).clip(35, 160)
    bmi = weight / (height/100)**2
    activity = np.random.randint(0, 5, N).astype(float)
    fv = np.random.randint(0, 5, N).astype(float)  # fruit/veg servings
    ff = np.random.randint(0, 7, N).astype(float)  # fast food days
    water = np.random.uniform(1, 4, N)
    fam_hist = np.random.binomial(1, 0.4, N).astype(float)
    risk = (bmi > 30).astype(float) * 0.5 + (ff > 3) * 0.15 + (activity < 2) * 0.15 + (fam_hist == 1) * 0.1 + (fv < 2) * 0.1 + np.random.normal(0, 0.05, N)
    y = (risk > 0.4).astype(int)
    X = np.column_stack([age, gender, height, weight, bmi, activity, fv, ff, water, fam_hist])
    return X, y
X, y = gen_obesity()
train_model(X, y, 'obesity')

# 10. STROKE
print("\n10. 🧠 Stroke Model")
def gen_stroke():
    age = np.random.normal(58, 16, N).clip(18, 90)
    htn = np.random.binomial(1, 0.35, N).astype(float)
    hd = np.random.binomial(1, 0.15, N).astype(float)
    married = np.random.binomial(1, 0.65, N).astype(float)
    work = np.random.randint(0, 5, N).astype(float)
    urban = np.random.binomial(1, 0.5, N).astype(float)
    glucose = np.random.normal(110, 40, N).clip(50, 300)
    bmi = np.random.normal(28, 6, N).clip(16, 50)
    smoking = np.random.randint(0, 4, N).astype(float)
    risk = (
        (age > 65) * 0.25 + (htn == 1) * 0.2 + (hd == 1) * 0.15 +
        (glucose > 150) * 0.15 + (bmi > 30) * 0.1 + (smoking > 1) * 0.1 +
        np.random.normal(0, 0.03, N)
    )
    y = (risk > 0.35).astype(int)
    X = np.column_stack([age, htn, hd, married, work, urban, glucose, bmi, smoking])
    return X, y
X, y = gen_stroke()
train_model(X, y, 'stroke')

# 11. STRESS
print("\n11. 😰 Stress Model")
def gen_stress():
    sleep = np.random.uniform(4, 9, N)
    hours = np.random.uniform(4, 14, N)
    activity = np.random.randint(0, 5, N).astype(float)
    support = np.random.randint(0, 5, N).astype(float)
    anxiety = np.random.randint(0, 10, N).astype(float)
    mood = np.random.randint(0, 10, N).astype(float)
    concentration = np.random.randint(0, 10, N).astype(float)
    fatigue = np.random.randint(0, 10, N).astype(float)
    risk = (
        (hours > 10) * 0.2 + (sleep < 6) * 0.2 + (anxiety > 6) * 0.25 +
        (fatigue > 7) * 0.15 + (support < 2) * 0.1 + (activity < 2) * 0.1 +
        np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.35).astype(int)
    X = np.column_stack([sleep, hours, activity, support, anxiety, mood, concentration, fatigue])
    return X, y
X, y = gen_stress()
train_model(X, y, 'stress')

# 12. DEPRESSION
print("\n12. 😔 Depression Model")
def gen_depression():
    features = []
    for _ in range(14):
        features.append(np.random.randint(0, 3, N).astype(float))
    X = np.column_stack(features)
    key_features = X[:, [0, 1, 2, 3, 4, 5]]  # sadness, euphoric, exhausted, sleep, mood, suicidal
    risk = key_features[:, 0] * 0.2 + key_features[:, 2] * 0.15 + key_features[:, 3] * 0.15 + key_features[:, 5] * 0.3 + key_features[:, 4] * 0.1 + np.random.normal(0, 0.1, N)
    y = (risk > 0.5).astype(int)
    return X, y
X, y = gen_depression()
train_model(X, y, 'depression')

# 13. PCOS
print("\n13. 🌸 PCOS Model")
def gen_pcos():
    age = np.random.normal(28, 7, N).clip(15, 45)
    bmi = np.random.normal(27, 6, N).clip(16, 50)
    cycle_len = np.random.normal(32, 12, N).clip(21, 90)
    married = np.random.binomial(1, 0.5, N).astype(float)
    pregnant = np.random.binomial(1, 0.2, N).astype(float)
    abortions = np.random.randint(0, 4, N).astype(float)
    fsh = np.random.normal(7, 4, N).clip(1, 25)
    lh = np.random.normal(9, 7, N).clip(1, 40)
    hip = np.random.normal(97, 12, N).clip(70, 140)
    waist = np.random.normal(80, 12, N).clip(55, 120)
    weight_gain = np.random.binomial(1, 0.4, N).astype(float)
    hair_growth = np.random.binomial(1, 0.35, N).astype(float)
    skin_dark = np.random.binomial(1, 0.3, N).astype(float)
    hair_loss = np.random.binomial(1, 0.3, N).astype(float)
    pimples = np.random.binomial(1, 0.5, N).astype(float)
    fast_food = np.random.binomial(1, 0.5, N).astype(float)
    exercise = np.random.binomial(1, 0.4, N).astype(float)
    risk = (
        (cycle_len > 35) * 0.2 + (lh/fsh > 2) * 0.2 + (bmi > 30) * 0.15 +
        (weight_gain == 1) * 0.1 + (hair_growth == 1) * 0.1 + (pimples == 1) * 0.1 +
        (fast_food == 1) * 0.05 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.3).astype(int)
    X = np.column_stack([age, bmi, cycle_len, married, pregnant, abortions, fsh, lh, hip, waist, weight_gain, hair_growth, skin_dark, hair_loss, pimples, fast_food, exercise])
    return X, y
X, y = gen_pcos()
train_model(X, y, 'pcos')

# 14. ARTHRITIS
print("\n14. 🦴 Arthritis Model")
def gen_arthritis():
    age = np.random.normal(52, 16, N).clip(18, 85)
    gender = np.random.binomial(1, 0.6, N).astype(float)
    bmi = np.random.normal(27, 6, N).clip(16, 50)
    joint_pain = np.random.randint(0, 10, N).astype(float)
    stiffness = np.random.randint(0, 10, N).astype(float)
    swelling = np.random.randint(0, 10, N).astype(float)
    fam_hist = np.random.binomial(1, 0.35, N).astype(float)
    activity = np.random.randint(0, 5, N).astype(float)
    smoking = np.random.binomial(1, 0.25, N).astype(float)
    injury = np.random.binomial(1, 0.2, N).astype(float)
    risk = (
        (age > 55) * 0.2 + (joint_pain > 5) * 0.25 + (stiffness > 5) * 0.2 +
        (bmi > 28) * 0.1 + (fam_hist == 1) * 0.1 + (swelling > 5) * 0.1 +
        (injury == 1) * 0.05 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.3).astype(int)
    X = np.column_stack([age, gender, bmi, joint_pain, stiffness, swelling, fam_hist, activity, smoking, injury])
    return X, y
X, y = gen_arthritis()
train_model(X, y, 'arthritis')

# 15. GENERAL HEALTH SCORE
print("\n15. 💯 General Health Score Model")
def gen_general():
    age = np.random.normal(42, 16, N).clip(18, 90)
    bmi = np.random.normal(25, 6, N).clip(16, 50)
    sys_bp = np.random.normal(125, 20, N).clip(80, 200)
    dia_bp = np.random.normal(82, 12, N).clip(50, 130)
    glucose = np.random.normal(100, 30, N).clip(60, 300)
    chol = np.random.normal(210, 50, N).clip(100, 400)
    smoking = np.random.binomial(1, 0.25, N).astype(float)
    alcohol = np.random.binomial(1, 0.3, N).astype(float)
    activity = np.random.randint(0, 5, N).astype(float)
    sleep = np.random.uniform(4, 10, N)
    stress = np.random.randint(0, 10, N).astype(float)
    diet = np.random.randint(0, 5, N).astype(float)
    risk = (
        (bmi > 28) * 0.15 + (sys_bp > 140) * 0.15 + (glucose > 120) * 0.15 +
        (chol > 240) * 0.1 + (smoking == 1) * 0.15 + (activity < 2) * 0.1 +
        (sleep < 6) * 0.1 + (stress > 6) * 0.1 + np.random.normal(0, 0.05, N)
    )
    y = (risk > 0.4).astype(int)
    X = np.column_stack([age, bmi, sys_bp, dia_bp, glucose, chol, smoking, alcohol, activity, sleep, stress, diet])
    return X, y
X, y = gen_general()
train_model(X, y, 'general_health')

print("\n" + "=" * 55)
print("✅ ALL 15 MODELS TRAINED SUCCESSFULLY!")
print(f"📁 Models saved to: {MODELS_DIR}")
print("=" * 55)
