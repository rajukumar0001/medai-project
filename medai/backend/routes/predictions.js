/**
 * Prediction Routes
 * POST /api/predictions/predict
 * GET  /api/predictions/history
 * GET  /api/predictions/:id
 * DELETE /api/predictions/:id
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const predictionController = require('../controllers/predictionController');

router.use(protect); // All prediction routes require auth

router.post('/predict', predictionController.predict);
router.get('/history', predictionController.getHistory);
router.get('/stats', predictionController.getStats);
router.get('/:id', predictionController.getPrediction);
router.delete('/:id', predictionController.deletePrediction);
router.patch('/:id/favorite', predictionController.toggleFavorite);

module.exports = router;
