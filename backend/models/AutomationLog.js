const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  totalCycles: {
    type: Number,
    required: true,
    default: 1
  },
  cyclesCompleted: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  automationType: {
    type: String,
    enum: ['registration', 'manual', 'infinite'],
    default: 'manual'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AutomationLog', automationLogSchema);