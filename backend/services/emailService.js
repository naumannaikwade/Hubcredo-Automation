class EmailService {
  async sendWelcome(user, metadata = {}) {
    const { cycle = 1, totalCycles = 1 } = metadata;

    console.log(`Email to: ${user.email} (Cycle ${cycle}/${totalCycles})`);

    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      to: user.email,
      subject: `Hubcredo Automation - Cycle ${cycle}`,
      cycle,
      totalCycles,
      timestamp: new Date().toISOString(),
      body: `Hello ${user.name}, this is automation cycle ${cycle} of ${totalCycles}.`
    };
  }

  async sendNotification(to, subject, message) {
    console.log(`Notification to: ${to}`);
    
    return { success: true, to, subject };
  }
}

module.exports = new EmailService();