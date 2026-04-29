/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const reportController = require('../controllers/reportController');

router.use(protect);

// Upload
router.post('/upload', handleUpload('report'), reportController.uploadReport);

// All reports
router.get('/', reportController.getReports);

// IMPORTANT: specific routes first
router.get('/:id/download', reportController.downloadReport);
router.patch('/:id/favorite', reportController.toggleFavorite);

// Single report
router.get('/:id', reportController.getReport);

// Delete
router.delete('/:id', reportController.deleteReport);

module.exports = router;