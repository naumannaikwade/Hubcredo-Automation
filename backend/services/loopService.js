const axios = require('axios');
const User = require('../models/User');

class LoopService {
  constructor() {
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    this.activeLoops = new Map();
  }

  async startLoop(userId, cycles = 3) {
    const loopId = `loop_${userId}_${Date.now()}`;
    
    console.log(`Starting loop ${loopId} for ${cycles} cycles`);
    
    this.activeLoops.set(loopId, {
      userId,
      status: 'running',
      currentCycle: 0,
      totalCycles: cycles,
      startTime: new Date(),
      logs: [],
      completedCycles: 0,
      failedCycles: 0
    });
    
    this.runLoopBackground(loopId, cycles);
    
    return {
      loopId,
      status: 'started',
      cycles,
      message: `Loop started with ${cycles} cycles`,
      webhookUrl: this.n8nWebhookUrl
    };
  }

  async runLoopBackground(loopId, totalCycles) {
    const loop = this.activeLoops.get(loopId);
    if (!loop) return;

    try {
      const user = await User.findById(loop.userId);
      if (!user) {
        console.log(`User not found for loop ${loopId}`);
        this.stopLoop(loopId);
        return;
      }

      console.log(`Running ${totalCycles} cycles for ${user.email}`);
      
      for (let cycle = 1; cycle <= totalCycles && loop.status === 'running'; cycle++) {
        console.log(`\nCYCLE ${cycle}/${totalCycles}:`);
        
        loop.currentCycle = cycle;
        this.activeLoops.set(loopId, loop);
        
        try {
          console.log(`   [${cycle}.1] Sending webhook to n8n...`);
          const webhookResult = await this.sendCycleWebhook(user, cycle, totalCycles);
          
          console.log(`   [${cycle}.2] Updating user stats...`);
          user.automationCount = (user.automationCount || 0) + 1;
          user.lastAutomation = new Date();
          await user.save();
          
          loop.logs.push({
            cycle,
            status: 'success',
            webhookResult,
            timestamp: new Date().toISOString()
          });
          
          loop.completedCycles++;
          console.log(`   Cycle ${cycle} completed successfully`);
          
        } catch (cycleError) {
          console.log(`   Cycle ${cycle} failed:`, cycleError.message);
          
          loop.logs.push({
            cycle,
            status: 'failed',
            error: cycleError.message,
            timestamp: new Date().toISOString()
          });
          
          loop.failedCycles++;
        }
        
        this.activeLoops.set(loopId, loop);
        
        if (cycle < totalCycles && loop.status === 'running') {
          console.log(`   Waiting 2 seconds before next cycle...`);
          await this.delay(2000);
        }
      }

      if (loop.status === 'running') {
        loop.status = 'completed';
        loop.endTime = new Date();
        loop.duration = loop.endTime - loop.startTime;
        this.activeLoops.set(loopId, loop);
        
        console.log(`\nLoop ${loopId} completed!`);
        console.log(`Results: ${loop.completedCycles}/${totalCycles} cycles successful`);
        
        await this.sendCompletionWebhook(user, loop);
      }

    } catch (error) {
      console.error(`Error in loop ${loopId}:`, error);
      loop.status = 'failed';
      loop.error = error.message;
      this.activeLoops.set(loopId, loop);
    }
  }

  async sendCycleWebhook(user, cycleNumber, totalCycles) {
    const payload = {
      event: 'automation_cycle',
      timestamp: new Date().toISOString(),
      source: 'hubcredo-backend',
      cycle: {
        number: cycleNumber,
        total: totalCycles,
        status: 'started'
      },
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      metadata: {
        loop: true,
        currentCycle: cycleNumber,
        totalCycles: totalCycles
      }
    };
    
    return await this.sendWebhook(payload);
  }

  async sendWebhook(payload) {
    try {
      if (!this.n8nWebhookUrl) {
        console.log('No n8n webhook URL configured, simulating webhook');
        return { success: true, simulated: true, payload };
      }
      
      console.log('Webhook payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(this.n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Hubcredo-Cycle': payload.cycle.number,
          'X-Hubcredo-Total': payload.cycle.total
        },
        timeout: 10000
      });
      
      console.log(`Webhook ${payload.cycle.number}/${payload.cycle.total} sent successfully`);
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
      
    } catch (error) {
      console.error(`Webhook failed for cycle ${payload?.cycle?.number}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendCompletionWebhook(user, loop) {
    const payload = {
      event: 'loop_completed',
      timestamp: new Date().toISOString(),
      user: {
        id: user._id,
        email: user.email
      },
      loop: {
        id: loop.userId ? `loop_${loop.userId}_${loop.startTime.getTime()}` : 'unknown',
        cyclesCompleted: loop.completedCycles,
        cyclesFailed: loop.failedCycles,
        totalCycles: loop.totalCycles,
        duration: loop.duration,
        status: loop.status
      },
      summary: {
        successRate: (loop.completedCycles / loop.totalCycles) * 100
      }
    };
    
    return await this.sendWebhook(payload);
  }

  stopLoop(loopId) {
    const loop = this.activeLoops.get(loopId);
    if (loop && loop.status === 'running') {
      loop.status = 'stopped';
      loop.endTime = new Date();
      this.activeLoops.set(loopId, loop);
      
      console.log(`Loop ${loopId} stopped at cycle ${loop.currentCycle}`);
      return true;
    }
    return false;
  }

  getLoopStatus(loopId) {
    return this.activeLoops.get(loopId) || null;
  }

  getAllLoops() {
    const loops = [];
    for (const [loopId, loop] of this.activeLoops) {
      loops.push({
        loopId,
        ...loop
      });
    }
    return loops;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new LoopService();