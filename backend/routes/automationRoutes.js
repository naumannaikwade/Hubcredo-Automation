const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const automationController = require('../controllers/automationController');

router.post('/start-loop', authMiddleware, automationController.startLoop);
router.get('/logs', authMiddleware, automationController.getLogs);
router.post('/test-webhook', async (req, res) => {
  console.log('Test webhook received:', req.body);
  res.json({
    success: true,
    message: 'Webhook received successfully',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;