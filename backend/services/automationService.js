const AutomationLog = require("../models/AutomationLog");
const User = require("../models/User");
const webhookService = require("./webhookService");
const emailService = require("./emailService");
const csvExport = require("../utils/csvExport");

class AutomationService {
  constructor() {
    this.activeLoops = {};
  }

  async runCycle(user, cycleNumber, totalCycles, logEntry) {
    const cycleStartedAt = new Date();
    const cycleSteps = [];

    try {
      const webhook1 = await webhookService.sendAutomationCycle(user, {
        cycleNumber: cycleNumber,
        step: "pre_email",
        action: "cycle_start",
      });

      cycleSteps.push({
        type: "webhook",
        step: "pre_email",
        status: webhook1.success ? "success" : "failed",
        timestamp: webhook1.timestamp,
        data: webhook1,
      });

      if (!webhook1.success) {
        throw new Error("Pre-email webhook failed");
      }

      const email = await emailService.sendWelcome(user, {
        cycle: cycleNumber,
        totalCycles: totalCycles,
      });

      cycleSteps.push({
        type: "email",
        step: "send",
        status: email.success ? "success" : "failed",
        timestamp: email.timestamp,
        data: email,
      });

      const webhook2 = await webhookService.sendAutomationCycle(user, {
        cycleNumber: cycleNumber,
        step: "post_email",
        action: "email_sent",
        emailData: email,
      });

      cycleSteps.push({
        type: "webhook",
        step: "post_email",
        status: webhook2.success ? "success" : "failed",
        timestamp: webhook2.timestamp,
        data: webhook2,
      });

      const cycleCompletedAt = new Date();

      logEntry.cycles.push({
        cycleNumber,
        status: "completed",
        steps: cycleSteps,
        startedAt: cycleStartedAt,
        completedAt: cycleCompletedAt,
        duration: cycleCompletedAt - cycleStartedAt,
      });

      return { success: true, cycleNumber };
    } catch (error) {
      const cycleCompletedAt = new Date();

      logEntry.cycles.push({
        cycleNumber,
        status: "failed",
        steps: cycleSteps,
        startedAt: cycleStartedAt,
        completedAt: cycleCompletedAt,
        duration: cycleCompletedAt - cycleStartedAt,
        error: error.message,
      });

      return { success: false, cycleNumber, error: error.message };
    }
  }

  async startAutomation(user, cycles = 3, automationType = "manual") {
    console.log(`Starting automation for: ${user.email}, Cycles: ${cycles}`);

    try {
      // Create log entry
      const automationLog = new AutomationLog({
        userId: user._id,
        userEmail: user.email,
        totalCycles: cycles,
        automationType,
        status: "running",
        cycles: [],
      });

      await automationLog.save();

      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i <= cycles; i++) {
        console.log(`Running cycle ${i}/${cycles}`);

        try {
          // Step 1: Send email
          console.log(`   Sending email for cycle ${i}...`);
          const emailResult = await emailService.sendWelcome(user, {
            cycle: i,
            totalCycles: cycles,
          });

          if (emailResult.success) {
            successCount++;
            console.log(`   Email sent successfully for cycle ${i}`);
          } else {
            failCount++;
            console.log(`   Email failed for cycle ${i}`);
          }

          // Add to log
          automationLog.cycles.push({
            cycleNumber: i,
            status: emailResult.success ? "completed" : "failed",
            startedAt: new Date(),
            completedAt: new Date(),
            steps: [
              {
                type: "email",
                step: "send",
                status: emailResult.success ? "success" : "failed",
                timestamp: new Date().toISOString(),
              },
            ],
          });
        } catch (error) {
          failCount++;
          console.error(`   Cycle ${i} error:`, error.message);

          automationLog.cycles.push({
            cycleNumber: i,
            status: "failed",
            startedAt: new Date(),
            completedAt: new Date(),
            error: error.message,
          });
        }

        // Wait between cycles (except last)
        if (i < cycles) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Update user stats
      try {
        await User.findByIdAndUpdate(user._id, {
          $inc: { automationCount: 1 },
          lastAutomation: new Date(),
        });
      } catch (dbError) {
        console.error("Failed to update user stats:", dbError.message);
      }

      // Update log status
      automationLog.successCount = successCount;
      automationLog.failCount = failCount;
      automationLog.status = successCount > 0 ? "completed" : "failed";
      await automationLog.save();

      return {
        success: true,
        logId: automationLog._id,
        cyclesRequested: cycles,
        cyclesCompleted: successCount,
        cyclesFailed: failCount,
        emailResults: {
          sent: successCount,
          failed: failCount,
        },
      };
    } catch (error) {
      console.error("Fatal error in startAutomation:", error);
      return {
        success: false,
        error: error.message,
        cyclesRequested: cycles,
        cyclesCompleted: 0,
        cyclesFailed: cycles,
      };
    }
  }

  async startInfiniteLoop(user, maxCycles = 10) {
    const loopId = `loop_${user._id}_${Date.now()}`;

    this.activeLoops[loopId] = {
      userId: user._id,
      userEmail: user.email,
      startTime: new Date(),
      cyclesCompleted: 0,
      status: "running",
    };

    this.runBackgroundLoop(user, maxCycles, loopId);

    return { loopId, maxCycles };
  }

  async runBackgroundLoop(user, maxCycles, loopId) {
    let cycleCount = 0;

    while (
      cycleCount < maxCycles &&
      this.activeLoops[loopId]?.status === "running"
    ) {
      cycleCount++;

      try {
        await this.startAutomation(user, 1, "infinite");
        this.activeLoops[loopId].cyclesCompleted = cycleCount;

        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Background loop error: ${error.message}`);
      }
    }

    if (this.activeLoops[loopId]) {
      this.activeLoops[loopId].status = "completed";
      this.activeLoops[loopId].endTime = new Date();
    }
  }

  stopLoop(loopId) {
    if (
      this.activeLoops[loopId] &&
      this.activeLoops[loopId].status === "running"
    ) {
      this.activeLoops[loopId].status = "stopped";
      return true;
    }
    return false;
  }

  getActiveLoops() {
    return Object.keys(this.activeLoops).map((id) => ({
      id,
      ...this.activeLoops[id],
    }));
  }
}

module.exports = new AutomationService();
