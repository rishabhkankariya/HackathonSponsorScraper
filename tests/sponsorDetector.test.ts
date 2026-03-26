import { describe, it, expect } from 'vitest';
import { SponsorDetector } from '../src/extraction/sponsorDetector';
import { CrawlResult } from '../src/crawler/baseCrawler';

describe('SponsorDetector', () => {
  const detector = new SponsorDetector();

  it('should detect logos from images with "sponsor" in URL', async () => {
    const mockCrawl: CrawlResult = {
      url: 'https://example-hackathon.com',
      text: 'Welcome to our hackathon!',
      images: [
        { url: 'https://cdn.com/sponsor-google-logo.png', alt: 'Google Logo' },
        { url: 'https://cdn.com/random-image.jpg', alt: 'A random pic' }
      ],
      status: 'success'
    };

    const results = await detector.extract(mockCrawl);
    expect(results).toHaveLength(1);
    expect(results[0].sponsor_name).toBe('Google Logo');
    expect(results[0].sponsor_type).toBe('logo');
  });

  it('should detect sponsors from text context', async () => {
    const mockCrawl: CrawlResult = {
      url: 'https://example-hackathon.com',
      text: 'Our Gold Sponsors\nMicrosoft\nIBM\n\nContact us for more info.',
      images: [],
      status: 'success'
    };

    const results = await detector.extract(mockCrawl);
    // Based on our naive heuristic: "Our Gold Sponsors" contains "sponsor"
    // Next line is "Microsoft". So it should pick it up.
    expect(results.some(r => r.sponsor_name === 'Microsoft')).toBe(true);
  });
});
