/**
 * Chatbot Routes — POST /api/chatbot/message
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/message', protect, async (req, res) => {
  try {
    const { message } = req.body;

    const reply = generateSmartReply(message, req.user);

    res.json({
      reply,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: 'Chatbot error.' });
  }
});

function generateSmartReply(message, user) {
  const msg = message.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi')) {
    return `Hello ${user?.name || ''}! 👋 How can I help you today?`;
  }

  if (msg.includes('diabetes')) {
    return `Diabetes is a disease where blood sugar becomes high.\n\nCommon symptoms:\n• Frequent urination\n• Excess thirst\n• Tiredness\n• Blurred vision\n\nHealthy diet and exercise help control it.`;
  }

  if (msg.includes('blood pressure') || msg.includes('bp')) {
    return `To lower blood pressure:\n• Reduce salt\n• Exercise daily\n• Manage stress\n• Sleep well\n• Avoid smoking\n• Check BP regularly`;
  }

  if (msg.includes('bmi')) {
    return `BMI = Weight (kg) ÷ Height² (m)\n\n18.5 - 24.9 = Normal\n25+ = Overweight\n30+ = Obese`;
  }

  if (msg.includes('heart')) {
    return `Heart disease risk factors:\n• High BP\n• Smoking\n• Diabetes\n• High cholesterol\n• Obesity\n• Stress`;
  }

  if (msg.includes('thyroid')) {
    return `Thyroid affects metabolism.\n\nSymptoms:\n• Weight change\n• Weakness\n• Hair fall\n• Mood change\n• Fast or slow heartbeat`;
  }

  if (msg.includes('stress')) {
    return `To reduce stress naturally:\n• Deep breathing\n• Exercise\n• Good sleep\n• Meditation\n• Talk to friends\n• Take breaks`;
  }

  if (msg.includes('fever')) {
    return `For fever:\n• Drink water\n• Rest well\n• Light food\n• Monitor temperature\nIf fever is high, see doctor.`;
  }

  if (msg.includes('cold') || msg.includes('cough')) {
    return `For cold/cough:\n• Warm water\n• Steam inhalation\n• Rest\n• Honey (if suitable)\nIf breathing problem occurs, consult doctor.`;
  }

  return `I understand your question: "${message}"\n\nPlease give me more details so I can help better.`;
}

module.exports = router;