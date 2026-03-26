import { Logger, Metrics } from './logger';

export class QueueManager {
  private queue: string[] = [];
  private processing = new Set<string>();
  private processed = new Set<string>();

  constructor(private concurrencyLimit: number = 5) {}

  add(urls: string[]) {
    for (const url of urls) {
      if (!this.processed.has(url) && !this.processing.has(url)) {
        this.queue.push(url);
      }
    }
  }

  async run(processFn: (url: string) => Promise<void>) {
    const promises: Promise<void>[] = [];
    
    while (this.queue.length > 0 || this.processing.size > 0) {
      while (this.processing.size < this.concurrencyLimit && this.queue.length > 0) {
        const url = this.queue.shift()!;
        this.processing.add(url);
        
        const promise = processFn(url).then(() => {
          this.processing.delete(url);
          this.processed.add(url);
          Metrics.stats.urlsProcessed++;
        }).catch(err => {
          this.processing.delete(url);
          this.processed.add(url);
          Metrics.stats.urlsFailed++;
          Logger.error(`Failed to process ${url}:`, err);
        });

        promises.push(promise);
      }
      
      // Wait for at least one to finish before spawning more
      if (this.processing.size >= this.concurrencyLimit) {
        await Promise.race(promises);
      }

      // Small tick delay to avoid busy-waiting if mostly idle
      await new Promise(res => setTimeout(res, 100));
    }

    await Promise.all(promises);
  }
}
