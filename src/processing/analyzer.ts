import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

export class ResultAnalyzer {
  static analyze() {
    const csvPath = path.resolve(process.cwd(), 'data', 'sponsors.csv');
    if (!fs.existsSync(csvPath)) return;

    const content = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(content, { columns: true }) as any[];

    const counts: Record<string, number> = {};
    for (const row of records) {
        const name = row.SPONSOR_NAME?.trim();
        if (name && name !== 'Unknown (Logo Only)') {
            counts[name] = (counts[name] || 0) + 1;
        }
    }

    const sorted = Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 10);

    console.log('\n--- 📈 Sponsor Frequency Analysis (Top 10) ---');
    sorted.forEach(([name, count], index) => {
        console.log(`${index + 1}. ${name}: ${count} hackathons`);
    });
    console.log('----------------------------------------------');
  }
}
