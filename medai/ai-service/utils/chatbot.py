"""
Health Chatbot
Keyword-based intelligent health Q&A chatbot
"""
import re, logging
logger = logging.getLogger(__name__)

HEALTH_KB = {
    'diabetes': {
        'keywords': ['diabetes', 'blood sugar', 'glucose', 'insulin', 'diabetic', 'hba1c'],
        'response': """**Diabetes** is a chronic condition where your body can't properly regulate blood glucose levels.

**Types:**
- **Type 1**: Autoimmune — body doesn't produce insulin
- **Type 2**: Body doesn't use insulin effectively (most common)
- **Gestational**: During pregnancy

**Warning Signs:** Frequent urination, excessive thirst, unexplained weight loss, blurry vision, slow healing

**Management:** Balanced diet, regular exercise, blood sugar monitoring, medications as prescribed

👉 Use our **Diabetes Prediction** tool to check your risk level!"""
    },
    'heart': {
        'keywords': ['heart', 'cardiac', 'chest pain', 'palpitation', 'cardiovascular', 'cholesterol', 'ecg'],
        'response': """**Heart Disease** is the leading cause of death globally, but largely preventable.

**Risk Factors:** High blood pressure, high cholesterol, smoking, diabetes, obesity, family history

**Warning Signs:** Chest pain or pressure, shortness of breath, irregular heartbeat, fatigue, swelling in legs

**Prevention:**
- Regular blood pressure checks
- Healthy diet low in saturated fats
- Exercise 150+ minutes/week
- Quit smoking
- Manage stress

👉 Try our **Heart Disease Prediction** tool for a personalized risk assessment!"""
    },
    'hypertension': {
        'keywords': ['hypertension', 'high blood pressure', 'bp', 'blood pressure'],
        'response': """**Hypertension** (High Blood Pressure) is often called the "silent killer" because it has no symptoms.

**Normal:** < 120/80 mmHg
**Elevated:** 120-129 / < 80 mmHg
**High Stage 1:** 130-139 / 80-89 mmHg
**High Stage 2:** ≥ 140 / ≥ 90 mmHg

**Lifestyle Changes:**
- Reduce sodium intake (< 2,300mg/day)
- DASH diet rich in fruits and vegetables
- Regular aerobic exercise
- Limit alcohol
- Manage stress

👉 Check your **BP Risk** using our prediction tool!"""
    },
    'symptom': {
        'keywords': ['symptom', 'feel', 'pain', 'ache', 'tired', 'fatigue', 'dizzy', 'nausea', 'headache'],
        'response': """I understand you might not be feeling well. While I can provide general health information, **I'm not a substitute for medical advice**.

**Common Symptoms & What They Might Indicate:**
- 🔴 **Persistent chest pain** → Seek emergency care immediately
- 🟡 **Fatigue** → Could be anemia, thyroid issues, sleep problems
- 🟡 **Frequent headaches** → Stress, hypertension, dehydration
- 🟢 **Mild nausea** → Diet, stress, mild infection

**Please consult a doctor** if symptoms are severe, persistent, or worsening.

👉 You can also upload your medical reports for AI-powered analysis!"""
    },
    'diet': {
        'keywords': ['diet', 'food', 'nutrition', 'eat', 'meal', 'weight', 'calorie'],
        'response': """**Healthy Eating Guidelines:**

🥗 **Fill half your plate** with colorful vegetables and fruits
🌾 **Choose whole grains**: brown rice, oats, whole wheat
🥩 **Lean proteins**: fish, chicken, legumes, tofu, eggs
🥑 **Healthy fats**: olive oil, avocado, nuts, seeds

**Foods to Limit:**
- Processed and packaged foods
- Added sugars and sweetened drinks
- Sodium (< 2,300mg/day)
- Red and processed meats
- Trans fats and excessive saturated fats

💧 **Stay hydrated**: 8-10 glasses of water daily

Need a personalized diet plan? Our disease prediction results include tailored diet recommendations!"""
    },
    'exercise': {
        'keywords': ['exercise', 'workout', 'fitness', 'walk', 'run', 'gym', 'physical activity'],
        'response': """**Physical Activity Guidelines (WHO):**

✅ **150-300 minutes** moderate-intensity per week OR
✅ **75-150 minutes** vigorous-intensity per week
✅ **Muscle-strengthening** 2+ days/week

**Great Exercises for General Health:**
- 🚶 Brisk walking — easiest to start
- 🏊 Swimming — low impact, full body
- 🚴 Cycling — great for cardiovascular health
- 🧘 Yoga — flexibility and stress reduction
- 💪 Strength training — muscle and bone health

**Tips:** Start slow, be consistent, find activities you enjoy. Even 10-minute bursts throughout the day count!"""
    },
    'report': {
        'keywords': ['report', 'upload', 'pdf', 'blood test', 'lab', 'result', 'analysis'],
        'response': """📄 **Medical Report Analysis Feature:**

Our AI can analyze your medical reports and:
✅ Extract all parameter values automatically
✅ Compare with standard normal ranges
✅ Highlight abnormal values with severity
✅ Generate a comprehensive summary
✅ Predict potential health risks
✅ Provide actionable recommendations

**Supported Reports:**
- CBC (Complete Blood Count)
- Blood Sugar / HbA1c
- Lipid Profile
- Thyroid Function (TSH, T3, T4)
- Liver Function (LFT/SGPT/SGOT)
- Kidney Function (KFT/Creatinine)
- General Health Checkup

👉 Go to **PDF Upload** section to analyze your reports now!"""
    },
    'appointment': {
        'keywords': ['appointment', 'doctor', 'hospital', 'consult', 'specialist', 'book'],
        'response': """🏥 **Finding the Right Doctor:**

Based on your health needs, here are specialists you might need:

| Condition | Specialist |
|-----------|-----------|
| Diabetes | Endocrinologist / Diabetologist |
| Heart Issues | Cardiologist |
| Kidney Problems | Nephrologist |
| Liver Issues | Hepatologist / Gastroenterologist |
| Thyroid | Endocrinologist |
| Mental Health | Psychiatrist / Psychologist |
| Women's Health | Gynecologist |
| Bone/Joint | Rheumatologist / Orthopedist |

💡 **Tip:** You can set appointment reminders in the **Reminders** section of MedAI!"""
    },
    'greeting': {
        'keywords': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you'],
        'response': """👋 **Hello! Welcome to MedAI Assistant!**

I'm your personal health AI assistant. Here's what I can help you with:

🔬 **Disease Information** — Ask about any disease or condition
📊 **Symptom Guidance** — Describe symptoms for general information
🥗 **Diet & Nutrition** — Healthy eating advice
🏋️ **Exercise Tips** — Fitness recommendations
📄 **Report Analysis** — How to use our PDF analysis feature
🏥 **Doctor Guidance** — Finding the right specialist

What would you like to know today?"""
    },
    'mental_health': {
        'keywords': ['stress', 'anxiety', 'depression', 'mental health', 'mood', 'sad', 'worried', 'panic'],
        'response': """💙 **Mental Health Matters**

It's important to take care of your mental health just as much as physical health.

**Signs You May Need Support:**
- Persistent sadness or hopelessness
- Excessive worry or fear
- Changes in sleep or appetite
- Difficulty concentrating
- Withdrawal from social activities

**Self-Care Strategies:**
- 😴 Prioritize 7-9 hours of sleep
- 🏃 Regular physical exercise
- 🧘 Mindfulness and meditation
- 👥 Stay connected with loved ones
- 📱 Limit social media use

**Seeking Help:** If symptoms persist, please consult a **Psychiatrist or Psychologist**. Mental health is treatable!

👉 Try our **Stress & Depression** assessment tools."""
    }
}

FALLBACK_RESPONSES = [
    "That's a great health question! While I can provide general information, for specific medical advice please consult a qualified healthcare professional.\n\n💡 You can also use our **Disease Prediction** tools for a detailed AI-powered health assessment!",
    "I'd recommend discussing this with your doctor for personalized medical advice. In the meantime, you can use our **AI Prediction** tools to get an initial health risk assessment based on your parameters.",
    "Great question! For accurate answers about your specific health situation, please consult a doctor. Our **Medical Report Analysis** tool can also help analyze your lab results!"
]

class HealthChatbot:
    def __init__(self):
        self._fallback_idx = 0

    def respond(self, message: str, history: list = None, user_context: dict = None) -> str:
        if not message or not message.strip():
            return "Please type a message and I'll be happy to help! 😊"

        msg_lower = message.lower()
        name = user_context.get('name', '') if user_context else ''
        greeting_prefix = f"Hi {name}! " if name and any(g in msg_lower for g in ['hello', 'hi', 'hey']) else ''

        # Match keywords
        for topic, data in HEALTH_KB.items():
            if any(kw in msg_lower for kw in data['keywords']):
                response = data['response']
                if greeting_prefix and topic == 'greeting':
                    response = response.replace("Hello!", f"Hello, {name}!")
                return response

        # Context-aware response using history
        if history:
            last_topic = self._detect_topic_from_history(history)
            if last_topic and last_topic in HEALTH_KB:
                return f"Continuing on {last_topic.replace('_', ' ')}... " + HEALTH_KB[last_topic]['response']

        # Fallback
        response = FALLBACK_RESPONSES[self._fallback_idx % len(FALLBACK_RESPONSES)]
        self._fallback_idx += 1
        return greeting_prefix + response

    def _detect_topic_from_history(self, history):
        for msg in reversed(history[-3:]):
            content = msg.get('content', '').lower()
            for topic, data in HEALTH_KB.items():
                if any(kw in content for kw in data['keywords']):
                    return topic
        return None
