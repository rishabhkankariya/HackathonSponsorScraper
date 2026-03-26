import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private static logDir = path.resolve(process.cwd(), 'logs');

  static {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  static log(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level}] ${message}`;
    console.log(formatted);
    
    fs.appendFileSync(
      path.join(this.logDir, 'app.log'),
      formatted + '\n'
    );
  }

  static error(message: string, error?: any) {
    this.log(`${message} ${error?.message || ''}`, 'ERROR');
  }
}

export class Metrics {
  static startTime = Date.now();
  static stats = {
    urlsProcessed: 0,
    urlsFailed: 0,
    sponsorsFound: 0,
  };

  static printSummary() {
    const duration = (Date.now() - this.startTime) / 1000;
    Logger.log('\n--- Final Job Summary ---');
    Logger.log(`Total URLs Processed: ${this.stats.urlsProcessed}`);
    Logger.log(`Failed URLs: ${this.stats.urlsFailed}`);
    Logger.log(`Total Sponsors Extracted: ${this.stats.sponsorsFound}`);
    Logger.log(`Duration: ${duration.toFixed(2)} seconds`);
    Logger.log(`Efficiency: ${(this.stats.sponsorsFound / this.stats.urlsProcessed).toFixed(2)} sponsors/URL`);
    Logger.log('--------------------------');
  }
}
