const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/stats', (req, res) => {
  console.log('/api/analytics/stats called');
  
  try {
    res.json({
      success: true,
      stats: {
        totalUsers: 10,
        activeUsers: 5,
        todayRegistrations: 2,
        totalAutomations: 25,
        completedAutomations: 20,
        activeLoops: 0
      }
    });
  } catch (error) {
    console.error('Error in /stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
});

router.get('/user-stats', authMiddleware, (req, res) => {
  console.log('/api/analytics/user-stats called for:', req.user?.email);
  
  try {
    res.json({
      success: true,
      stats: {
        totalAutomations: 3,
        successfulCycles: 9,
        failedCycles: 0,
        recentAutomations: 3
      },
      recentLogs: [
        {
          id: 1,
          automationType: 'registration',
          totalCycles: 3,
          status: 'completed',
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error in /user-stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
});

module.exports = router;