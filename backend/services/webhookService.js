const axios = require('axios');

class WebhookService {
  constructor() {
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/hubcredo-signup';
    this.timeout = 5000;
  }

  async sendToN8N(payload) {
    try {
      console.log(`Sending webhook to n8n: ${this.n8nWebhookUrl}`);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(this.n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Hubcredo-Signature': `hubcredo-${Date.now()}`
        },
        timeout: this.timeout
      });
      
      console.log(`n8n webhook successful: ${response.status}`);
      
      return {
        success: true,
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`n8n webhook failed:`, error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async sendUserRegistration(userData) {
    const payload = {
      event: 'user_registered',
      timestamp: new Date().toISOString(),
      source: 'hubcredo-backend',
      user: {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt
      },
      automation: {
        type: 'registration',
        cycles: 3,
        platform: 'Hubcredo AI'
      }
    };
    
    return await this.sendToN8N(payload);
  }

  async sendAutomationCycle(userData, cycleData) {
    const payload = {
      event: 'automation_cycle',
      timestamp: new Date().toISOString(),
      source: 'hubcredo-backend',
      user: {
        id: userData._id || userData.id,
        email: userData.email
      },
      cycle: {
        number: cycleData.cycleNumber,
        step: cycleData.step,
        action: cycleData.action,
        status: 'started'
      },
      metadata: cycleData.metadata || {}
    };
    
    return await this.sendToN8N(payload);
  }

  async sendAutomationComplete(userData, summary) {
    const payload = {
      event: 'automation_completed',
      timestamp: new Date().toISOString(),
      source: 'hubcredo-backend',
      user: {
        id: userData._id || userData.id,
        email: userData.email
      },
      automation: {
        total_cycles: summary.totalCycles,
        completed_cycles: summary.completedCycles,
        duration_seconds: summary.duration,
        success_rate: summary.successRate
      }
    };
    
    return await this.sendToN8N(payload);
  }
}

module.exports = new WebhookService();