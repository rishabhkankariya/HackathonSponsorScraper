import { chromium, Browser, Page } from 'playwright';

import { LinkDiscoverer } from './linkDiscoverer';

export interface CrawlResult {
  url: string;
  text: string;
  images: Array<{ url: string; alt: string; dimensions?: { width: number; height: number } }>;
  status: 'success' | 'failed';
  error?: string;
}

export class BaseCrawler {
  private browser: Browser | null = null;
  private linkDiscoverer = new LinkDiscoverer();

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    if (this.browser) await this.browser.close();
  }

  private async autoScroll(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 250; // Increased speed slightly
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 150);
      });
    });
  }

  async crawl(url: string): Promise<CrawlResult> {
    if (!this.browser) await this.init();
    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
    });
    const page: Page = await context.newPage();

    try {
      console.log(`Crawling: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Auto-scroll to trigger lazy loading
      await this.autoScroll(page);
      
      // Wait for any remaining async content
      await page.waitForTimeout(1500);

      const text = await page.innerText('body');
      
      const images = await page.$$eval('img', (imgs) => {
        return imgs.map(img => ({
          url: (img as HTMLImageElement).src,
          alt: (img as HTMLImageElement).alt || '',
          dimensions: {
            width: (img as HTMLImageElement).naturalWidth,
            height: (img as HTMLImageElement).naturalHeight
          }
        }));
      });

      return {
        url,
        text,
        images: images.filter(img => img.url),
        status: 'success'
      };
    } catch (error: any) {
      console.error(`Failed to crawl ${url}:`, error.message);
      return {
        url,
        text: '',
        images: [],
        status: 'failed',
        error: error.message
      };
    } finally {
      await page.close();
      await context.close();
    }
  }

  async crawlSite(entryUrl: string): Promise<CrawlResult[]> {
    if (!this.browser) await this.init();
    
    // First crawl the homepage
    const homeResult = await this.crawl(entryUrl);
    if (homeResult.status === 'failed') return [homeResult];

    // Find and follow "Sponsor" / "Partner" links
    const context = await this.browser!.newContext();
    const page = await context.newPage();
    await page.goto(entryUrl, { waitUntil: 'domcontentloaded' });
    const discoveredLinks = await this.linkDiscoverer.findSponsorLinks(page);
    await page.close();
    await context.close();

    const results: CrawlResult[] = [homeResult];
    
    // Limits sub-crawls to avoid endless loops
    for (const link of discoveredLinks.slice(0, 3)) {
       if (link === entryUrl) continue;
       const result = await this.crawl(link);
       results.push(result);
    }

    return results;
  }
}
