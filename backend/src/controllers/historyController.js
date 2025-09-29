const mongoose = require('mongoose');
const History = require('../models/History');
const User = require('../models/User');

// Helper function to log history
const logHistory = async (userId, action, description, metadata = {}, req = null) => {
  try {
    const historyData = {
      userId,
      action,
      description,
      metadata: {
        ...metadata,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent')
      }
    };

    const history = new History(historyData);
    await history.save();
    return history;
  } catch (error) {
    console.error('Error logging history:', error);
    // Don't throw error to prevent disrupting main functionality
  }
};

// Get user's complete history
const getUserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, startDate, endDate } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId };
    
    if (action && action !== 'ALL') {
      query.action = action;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const history = await History.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    const total = await History.countDocuments(query);

    res.json({
      history,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get history statistics for dashboard
const getHistoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await History.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      }
    ]);

    // Get total activity count
    const totalActivities = await History.countDocuments({ userId });

    // Get recent activity (last 10)
    const recentActivity = await History.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('action description timestamp metadata');

    // Get daily activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await History.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      stats,
      totalActivities,
      recentActivity,
      dailyActivity
    });
  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete specific history entry (optional - for user privacy)
const deleteHistoryEntry = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user.id;

    const history = await History.findOne({ _id: historyId, userId });
    
    if (!history) {
      return res.status(404).json({ msg: 'History entry not found' });
    }

    await History.findByIdAndDelete(historyId);

    // Log this deletion
    await logHistory(
      userId,
      'HISTORY_DELETE',
      `Deleted history entry: ${history.action}`,
      { deletedEntry: history.action },
      req
    );

    res.json({ msg: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Clear all user history (optional)
const clearAllHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const deleteCount = await History.deleteMany({ userId });

    // Log this action (ironic, but important for audit trail)
    await logHistory(
      userId,
      'HISTORY_CLEAR',
      `Cleared all history - ${deleteCount.deletedCount} entries removed`,
      { deletedCount: deleteCount.deletedCount },
      req
    );

    res.json({ 
      msg: 'All history cleared successfully',
      deletedCount: deleteCount.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  logHistory,
  getUserHistory,
  getHistoryStats,
  deleteHistoryEntry,
  clearAllHistory
};
