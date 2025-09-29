const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getUserHistory,
  getHistoryStats,
  deleteHistoryEntry,
  clearAllHistory
} = require('../controllers/historyController');

// @route   GET /api/history
// @desc    Get user's complete history with pagination and filters
// @access  Private
router.get('/', authMiddleware, getUserHistory);

// @route   GET /api/history/stats
// @desc    Get user's history statistics for dashboard
// @access  Private
router.get('/stats', authMiddleware, getHistoryStats);

// @route   DELETE /api/history/:historyId
// @desc    Delete a specific history entry
// @access  Private
router.delete('/:historyId', authMiddleware, deleteHistoryEntry);

// @route   DELETE /api/history/clear/all
// @desc    Clear all user history
// @access  Private
router.delete('/clear/all', authMiddleware, clearAllHistory);

module.exports = router;
