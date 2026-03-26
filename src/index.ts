import { GoogleScraper } from './discovery/googleScraper';
import { BaseCrawler } from './crawler/baseCrawler';
import { SponsorDetector } from './extraction/sponsorDetector';
import { CsvStore } from './storage/csvStore';
import { QueryExpander } from './discovery/queryExpander';
import { QueueManager } from './utils/queueManager';
import { Logger, Metrics } from './utils/logger';
import { ResultAnalyzer } from './processing/analyzer';
import * as dotenv from 'dotenv';

dotenv.config();

async function runScrapingJob() {
  Logger.log('🚀 Starting New Scraping Job...');
  
  const googleScraper = new GoogleScraper();
  const crawler = new BaseCrawler();
  const detector = new SponsorDetector();
  const store = new CsvStore();

  const queries = QueryExpander.generateQueries().slice(0, 20); // Scale to 20 queries per run
  const discoveryQueue = new QueueManager(1); // One Google Search thread
  const crawlQueue = new QueueManager(5); // Five parallel crawling threads

  try {
    const allUrls = new Set<string>();

    for (const query of queries) {
      Logger.log(`Searching for: ${query}`);
      const urls = await googleScraper.search(query, 2); // 2 pages per query
      urls.forEach((u: string) => allUrls.add(u));
      
      // Random delay between search queries
      await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
    }

    Logger.log(`Found ${allUrls.size} unique URLs to crawl.`);

    await crawlQueue.add(Array.from(allUrls));
    
    await crawlQueue.run(async (url) => {
      try {
        const results = await crawler.crawlSite(url);
        for (const res of results) {
           if (res.status === 'success') {
              const sponsors = await detector.extract(res);
              if (sponsors.length > 0) {
                 await store.save(sponsors);
                 Metrics.stats.sponsorsFound += sponsors.length;
                 Logger.log(`✅ Extracted ${sponsors.length} sponsors from ${res.url}`);
              }
           }
        }
      } catch (err: any) {
        Logger.error(`Failed crawling ${url}`, err);
      }
    });

  } catch (error: any) {
    Logger.error('Critical Job Failure:', error);
  } finally {
    Metrics.printSummary();
    ResultAnalyzer.analyze();
    await googleScraper.close();
    await crawler.close();
  }
}

runScrapingJob().then(() => console.log('Scraping job complete!'));
