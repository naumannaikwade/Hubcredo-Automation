const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const loopService = require('../services/loopService');

router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { cycles = 10 } = req.body;
    const user = req.user;
    
    if (cycles < 1 || cycles > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cycles must be between 1 and 100'
      });
    }
    
    const result = await loopService.startLoop(user._id, cycles);
    
    res.json({
      success: true,
      message: 'Loop started successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error starting loop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start loop: ' + error.message
    });
  }
});

router.post('/stop', authMiddleware, async (req, res) => {
  try {
    const { loopId } = req.body;
    
    if (!loopId) {
      return res.status(400).json({
        success: false,
        message: 'loopId is required'
      });
    }
    
    const stopped = loopService.stopLoop(loopId);
    
    if (stopped) {
      res.json({
        success: true,
        message: 'Loop stopped successfully',
        loopId
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Loop not found or already stopped'
      });
    }
    
  } catch (error) {
    console.error('Error stopping loop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop loop: ' + error.message
    });
  }
});

router.get('/status/:loopId', authMiddleware, async (req, res) => {
  try {
    const { loopId } = req.params;
    const status = loopService.getLoopStatus(loopId);
    
    if (status) {
      res.json({
        success: true,
        data: status
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Loop not found'
      });
    }
    
  } catch (error) {
    console.error('Error getting loop status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loop status: ' + error.message
    });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const allLoops = loopService.getAllLoops();
    
    const userLoops = allLoops.filter(loop => 
      loop.userId && loop.userId.toString() === user._id.toString()
    );
    
    res.json({
      success: true,
      count: userLoops.length,
      data: userLoops
    });
    
  } catch (error) {
    console.error('Error getting all loops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loops: ' + error.message
    });
  }
});

router.get('/active', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const allLoops = loopService.getAllLoops();
    
    const activeLoops = allLoops.filter(loop => 
      loop.userId && 
      loop.userId.toString() === user._id.toString() &&
      loop.status === 'running'
    );
    
    res.json({
      success: true,
      count: activeLoops.length,
      data: activeLoops
    });
    
  } catch (error) {
    console.error('Error getting active loops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active loops: ' + error.message
    });
  }
});

module.exports = router;