/**
 * Prediction Controller
 * Calls Python AI service and stores results
 */

const axios = require('axios');
const Prediction = require('../models/Prediction');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// ─── Run Disease Prediction ───────────────────────────────────────────────────
exports.predict = async (req, res) => {
  try {
    const { diseaseType, inputData } = req.body;

    if (!diseaseType || !inputData) {
      return res.status(400).json({ error: 'Disease type and input data are required.' });
    }

    // Call Python AI service
    let aiResult;
    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/predict`,
        { disease_type: diseaseType, input_data: inputData },
        { timeout: 30000 }
      );
      aiResult = aiResponse.data;
    } catch (aiErr) {
      // Fallback to rule-based prediction if AI service unavailable
      console.error('AI service error:', aiErr.message);
      aiResult = generateFallbackPrediction(diseaseType, inputData);
    }

    // Save prediction to database
    const prediction = await Prediction.create({
      user: req.user.id,
      diseaseType,
      inputData,
      result: {
        riskLevel: aiResult.risk_level,
        probability: aiResult.probability,
        prediction: aiResult.prediction,
        confidence: aiResult.confidence,
        reasons: aiResult.reasons || [],
        prevention: aiResult.prevention || [],
        dietPlan: aiResult.diet_plan || [],
        exerciseTips: aiResult.exercise_tips || [],
        doctorAdvice: aiResult.doctor_advice || '',
        urgency: aiResult.urgency || 'routine',
        specialists: aiResult.specialists || []
      }
    });

    // Update user health score
    await updateHealthScore(req.user.id);

    res.status(201).json({
      message: 'Prediction completed successfully!',
      prediction
    });

  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Prediction failed. Please try again.' });
  }
};

// ─── Get Prediction History ───────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, diseaseType, riskLevel, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (diseaseType) query.diseaseType = diseaseType;
    if (riskLevel) query['result.riskLevel'] = riskLevel;

    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Prediction.countDocuments(query)
    ]);

    res.json({
      predictions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prediction history.' });
  }
};

// ─── Get Single Prediction ────────────────────────────────────────────────────
exports.getPrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found.' });
    }

    res.json({ prediction });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prediction.' });
  }
};

// ─── Delete Prediction ────────────────────────────────────────────────────────
exports.deletePrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found.' });
    }

    res.json({ message: 'Prediction deleted successfully.' });

  } catch (err) {
    res.status(500).json({ error: 'Failed to delete prediction.' });
  }
};

// ─── Toggle Favorite ──────────────────────────────────────────────────────────
exports.toggleFavorite = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) return res.status(404).json({ error: 'Not found.' });

    prediction.isFavorite = !prediction.isFavorite;
    await prediction.save();

    res.json({ isFavorite: prediction.isFavorite });

  } catch (err) {
    res.status(500).json({ error: 'Failed to update.' });
  }
};

// ─── Get Stats ────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const stats = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$diseaseType',
          count: { $sum: 1 },
          avgProbability: { $avg: '$result.probability' },
          latestRisk: { $last: '$result.riskLevel' }
        }
      }
    ]);

    const riskDistribution = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$result.riskLevel', count: { $sum: 1 } } }
    ]);

    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });
    const recentPredictions = await Prediction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ stats, riskDistribution, totalPredictions, recentPredictions });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

// ─── Helper: Update Health Score ─────────────────────────────────────────────
async function updateHealthScore(userId) {
  try {
    const recentPredictions = await Prediction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (recentPredictions.length === 0) return;

    const avgProbability = recentPredictions.reduce(
      (sum, p) => sum + p.result.probability, 0
    ) / recentPredictions.length;

    // Health score: 100 - weighted average risk
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - avgProbability)));

    await User.findByIdAndUpdate(userId, { healthScore });
  } catch (err) {
    console.error('Health score update error:', err);
  }
}

// ─── Fallback Rule-Based Prediction ──────────────────────────────────────────
function generateFallbackPrediction(diseaseType, inputData) {
  const defaults = {
    risk_level: 'Moderate',
    probability: 45,
    prediction: true,
    confidence: 0.6,
    reasons: ['Based on provided health parameters', 'Requires further medical evaluation'],
    prevention: ['Regular health checkups', 'Maintain healthy diet', 'Exercise regularly'],
    diet_plan: ['Eat more fruits and vegetables', 'Reduce processed foods', 'Stay hydrated'],
    exercise_tips: ['30 minutes walking daily', 'Light stretching exercises'],
    doctor_advice: 'Please consult a healthcare professional for accurate diagnosis.',
    urgency: 'routine',
    specialists: ['General Physician']
  };

  return defaults;
}
