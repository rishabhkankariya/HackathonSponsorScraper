import { createObjectCsvWriter } from 'csv-writer';
import { Sponsor } from '../types/schema';
import * as fs from 'fs';
import * as path from 'path';

export class CsvStore {
  private filePath: string;

  constructor(fileName: string = 'sponsors.csv') {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, fileName);
  }

  async save(sponsors: Sponsor[]) {
    if (sponsors.length === 0) return;

    const fileExists = fs.existsSync(this.filePath);
    const writer = createObjectCsvWriter({
      path: this.filePath,
      header: [
        { id: 'hackathon_name', title: 'HACKATHON_NAME' },
        { id: 'hackathon_url', title: 'HACKATHON_URL' },
        { id: 'sponsor_name', title: 'SPONSOR_NAME' },
        { id: 'sponsor_type', title: 'SPONSOR_TYPE' },
        { id: 'category', title: 'CATEGORY' },
        { id: 'logo_url', title: 'LOGO_URL' },
        { id: 'logo_alt', title: 'LOGO_ALT' },
        { id: 'source', title: 'SOURCE' },
        { id: 'timestamp', title: 'TIMESTAMP' },
      ],
      append: fileExists,
    });

    try {
      await writer.writeRecords(sponsors);
      console.log(`Saved ${sponsors.length} sponsors to ${this.filePath}`);
    } catch (error) {
      console.error('Error writing CSV:', error);
    }
  }
}
