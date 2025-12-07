const fs = require('fs');
const path = require('path');

class CSVExport {
  constructor() {
    // Use absolute path
    this.csvFile = path.join(process.cwd(), 'logs/users-database.csv');
    this.jsonFile = path.join(process.cwd(), 'logs/users-backup.json');
    this.initFiles();
  }

  initFiles() {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      if (!fs.existsSync(this.csvFile)) {
        const headers = 'Timestamp,UserID,Name,Email,Status,Source,AutomationCount\n';
        fs.writeFileSync(this.csvFile, headers);
      }
    } catch (error) {
      console.error('Failed to initialize CSV files:', error.message);
      // Don't throw - just log
    }
  }

  async saveUser(user) {
    try {
      const timestamp = new Date().toISOString();
      
      const csvRow = `${timestamp},${user._id},${user.name},${user.email},active,web,${user.automationCount || 0}\n`;
      fs.appendFileSync(this.csvFile, csvRow);

      let jsonData = [];
      if (fs.existsSync(this.jsonFile)) {
        try {
          jsonData = JSON.parse(fs.readFileSync(this.jsonFile, 'utf8'));
        } catch (parseError) {
          console.error('Failed to parse JSON file, starting fresh:', parseError.message);
          jsonData = [];
        }
      }

      jsonData.push({
        timestamp,
        userId: user._id,
        name: user.name,
        email: user.email,
        automationCount: user.automationCount || 0,
        status: 'active'
      });

      fs.writeFileSync(this.jsonFile, JSON.stringify(jsonData, null, 2));

      return {
        success: true,
        files: ['users-database.csv', 'users-backup.json']
      };

    } catch (error) {
      console.error('CSV export error:', error.message);
      // Return failure instead of throwing
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CSVExport();