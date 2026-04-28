/**
 * Report Routes
 * POST /api/reports/upload  - Upload and analyze PDF
 * GET  /api/reports          - Get user reports
 * GET  /api/reports/:id      - Get single report
 * DELETE /api/reports/:id    - Delete report
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const reportController = require('../controllers/reportController');

router.use(protect);

router.post('/upload', handleUpload('report'), reportController.uploadReport);
router.get('/', reportController.getReports);
router.get('/:id', reportController.getReport);
router.delete('/:id', reportController.deleteReport);
router.patch('/:id/favorite', reportController.toggleFavorite);
router.get('/:id/download', reportController.downloadReport);

module.exports = router;
