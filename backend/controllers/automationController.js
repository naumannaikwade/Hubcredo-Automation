const automationService = require('../services/automationService');
const AutomationLog = require('../models/AutomationLog');

class AutomationController {
  async startLoop(req, res, next) {
    try {
      const { cycles = 3 } = req.body;
      const user = req.user;

      if (cycles < 1 || cycles > 20) {
        const error = new Error('Cycles must be between 1 and 20');
        error.status = 400;
        throw error;
      }

      const result = await automationService.startAutomation(user, cycles, 'manual');

      res.json({
        success: true,
        message: `Automation started (${cycles} cycles)`,
        ...result
      });

    } catch (error) {
      next(error);
    }
  }

  async startInfiniteLoop(req, res, next) {
    try {
      const { maxCycles = 10 } = req.body;
      const user = req.user;

      if (maxCycles < 1 || maxCycles > 100) {
        const error = new Error('Max cycles must be between 1 and 100');
        error.status = 400;
        throw error;
      }

      const { loopId, maxCycles: actualMaxCycles } = await automationService.startInfiniteLoop(user, maxCycles);

      res.json({
        success: true,
        message: 'Infinite loop started in background',
        loopId,
        maxCycles: actualMaxCycles,
        monitorUrl: '/api/automation/loop-status'
      });

    } catch (error) {
      next(error);
    }
  }

  async getLoopStatus(req, res, next) {
    try {
      const activeLoops = automationService.getActiveLoops();

      res.json({
        success: true,
        activeLoops,
        count: activeLoops.length
      });

    } catch (error) {
      next(error);
    }
  }

  async stopLoop(req, res, next) {
    try {
      const { loopId } = req.body;
      const user = req.user;

      const loops = automationService.getActiveLoops();
      const loop = loops.find(l => l.id === loopId);

      if (!loop) {
        const error = new Error('Loop not found');
        error.status = 404;
        throw error;
      }

      if (loop.userId.toString() !== user._id.toString()) {
        const error = new Error('Not authorized to stop this loop');
        error.status = 403;
        throw error;
      }

      const stopped = automationService.stopLoop(loopId);

      res.json({
        success: true,
        message: stopped ? 'Loop stopped successfully' : 'Loop was not running',
        loopId
      });

    } catch (error) {
      next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const { limit = 10, page = 1 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const userId = req.user._id;

      const logs = await AutomationLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await AutomationLog.countDocuments({ userId });

      res.json({
        success: true,
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AutomationController();