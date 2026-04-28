/**
 * Analytics Routes — /api/analytics
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Prediction = require('../models/Prediction');
const Report = require('../models/Report');

router.use(protect);

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;
    const [
      totalPredictions,
      totalReports,
      recentPredictions,
      riskDistribution,
      monthlyActivity,
      diseaseBreakdown
    ] = await Promise.all([
      Prediction.countDocuments({ user: userId }),
      Report.countDocuments({ user: userId }),
      Prediction.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Prediction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$result.riskLevel', count: { $sum: 1 } } }
      ]),
      Prediction.aggregate([
        { $match: { user: userId, createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } }
      ]),
      Prediction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$diseaseType', count: { $sum: 1 }, avgRisk: { $avg: '$result.probability' } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalPredictions,
      totalReports,
      recentPredictions,
      riskDistribution,
      monthlyActivity,
      diseaseBreakdown,
      healthScore: req.user.healthScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// Trend data for charts
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trends = await Prediction.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        avgProbability: { $avg: '$result.probability' }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({ trends });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends.' });
  }
});

module.exports = router;
