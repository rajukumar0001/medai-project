/**
 * Chatbot Routes — POST /api/chatbot/message
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');

router.post('/message', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

    let aiReply;
    try {
      const response = await axios.post(`${AI_URL}/chatbot`, {
        message,
        history,
        user_context: {
          name: req.user.name,
          age: req.user.age,
          gender: req.user.gender
        }
      }, { timeout: 15000 });
      aiReply = response.data.reply;
    } catch (err) {
      // Fallback keyword-based responses
      aiReply = generateFallbackReply(message);
    }

    res.json({ reply: aiReply, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Chatbot error.' });
  }
});

function generateFallbackReply(message) {
  const msg = message.toLowerCase();
  if (msg.includes('diabetes')) return 'Diabetes is a condition where blood sugar levels are too high. Key symptoms include frequent urination, excessive thirst, and fatigue. Please use our Prediction tool for a risk assessment!';
  if (msg.includes('heart')) return 'Heart disease risk factors include high blood pressure, high cholesterol, smoking, and obesity. Regular checkups are essential. Use our Heart Disease Prediction tool!';
  if (msg.includes('symptom') || msg.includes('feel')) return 'I understand you may not be feeling well. Please describe your symptoms and I\'ll try to help. Remember, always consult a doctor for medical advice.';
  if (msg.includes('diet') || msg.includes('food')) return 'A healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, sugar, and sodium.';
  if (msg.includes('exercise')) return 'The WHO recommends at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week, plus muscle-strengthening activities 2+ days/week.';
  if (msg.includes('hello') || msg.includes('hi')) return `Hello! 👋 I'm MedAI Assistant. I can help you with health questions, symptoms, disease information, and navigation. How can I help you today?`;
  return 'That\'s a great health question! For accurate medical advice, please use our Disease Prediction tool or consult with a healthcare professional. I\'m here to provide general health information and guidance.';
}

module.exports = router;
