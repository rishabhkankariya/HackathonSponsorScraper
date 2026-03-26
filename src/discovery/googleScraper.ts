import { chromium, Browser, Page } from 'playwright';

export interface SearchResult {
  url: string;
  title: string;
}

export class GoogleScraper {
  private browser: Browser | null = null;

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    if (this.browser) await this.browser.close();
  }

  async search(query: string, maxPages: number = 3): Promise<string[]> {
    if (!this.browser) await this.init();
    const page: Page = await this.browser!.newPage();
    const urls: Set<string> = new Set();

    try {
      for (let i = 0; i < maxPages; i++) {
        const start = i * 10;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${start}`;
        console.log(`Searching Google: ${searchUrl}`);
        
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
        
        // Handle potential Google consent/cookie banner
        const consentButton = await page.$('button:has-text("I agree"), button:has-text("Accept all")');
        if (consentButton) await consentButton.click();
        
        // Modern Google Search results selectors
        const resultUrls = await page.$$eval('#search .yuRUbf a, #rso a:has(h3), .g a', (links) => {
          return links
            .map(link => (link as HTMLAnchorElement).href)
            .filter(href => {
              if (!href) return false;
              // Filter out Google-specific links, caches, and similar
              const isGoogle = href.includes('google.com/');
              const isRelevant = !href.includes('webcache.googleusercontent.com');
              return !isGoogle || isRelevant && href.includes('url?q=');
            });
        });

        for (let url of resultUrls) {
          if (url.includes('url?q=')) {
            const match = url.match(/url\?q=([^&]*)/);
            if (match && match[1]) {
              url = decodeURIComponent(match[1]);
            }
          }
          if (url.startsWith('http') && !url.includes('google.com/')) {
            urls.add(url);
          }
        }
        
        console.log(`Page ${i+1}: Found ${resultUrls.length} raw results, ${urls.size} unique external links so far.`);

        // Random delay to avoid blocking
        await new Promise(res => setTimeout(res, 1000 + Math.random() * 2000));
        
        // Check if there is a 'Next' button
        const nextButton = await page.$('#pnnext');
        if (!nextButton) break;
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      await page.close();
    }

    return Array.from(urls);
  }
}
