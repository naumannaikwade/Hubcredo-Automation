const User = require('../models/User');
const AutomationLog = require('../models/AutomationLog');
const automationService = require('../services/automationService');

class AnalyticsController {
  async getStats(req, res, next) {
    try {
      const [
        totalUsers,
        activeUsers,
        todayUsers,
        totalAutomations,
        completedAutomations
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        AutomationLog.countDocuments(),
        AutomationLog.countDocuments({ status: 'completed' })
      ]);

      const activeLoops = automationService.getActiveLoops();

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          todayRegistrations: todayUsers,
          totalAutomations,
          completedAutomations,
          activeLoops: activeLoops.length
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getUserAnalytics(req, res, next) {
    try {
      const userId = req.user._id;

      const [
        totalLogs,
        successfulCycles,
        failedCycles,
        recentLogs
      ] = await Promise.all([
        AutomationLog.countDocuments({ userId }),
        AutomationLog.aggregate([
          { $match: { userId: userId } },
          { $group: { _id: null, total: { $sum: '$successCount' } } }
        ]),
        AutomationLog.aggregate([
          { $match: { userId: userId } },
          { $group: { _id: null, total: { $sum: '$failCount' } } }
        ]),
        AutomationLog.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);

      res.json({
        success: true,
        stats: {
          totalAutomations: totalLogs,
          successfulCycles: successfulCycles[0]?.total || 0,
          failedCycles: failedCycles[0]?.total || 0,
          recentAutomations: recentLogs.length
        },
        recentLogs
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();