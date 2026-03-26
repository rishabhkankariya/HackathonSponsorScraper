import { CrawlResult } from '../crawler/baseCrawler';
import { Sponsor } from '../types/schema';

import { GeminiService } from './geminiService';
import { DataNormalizer } from '../processing/dataNormalizer';

export class SponsorDetector {
  private gemini = new GeminiService();
  private sponsorKeywords = [
    'sponsor', 'partner', 'powered by', 'supported by', 'collaborator',
    'title sponsor', 'gold sponsor', 'silver sponsor', 'community partner',
    'associate sponsor', 'event partner', 'official partner'
  ];

  private logoKeywords = [
    'logo', 'sponsor', 'partner', 'brand', 'company'
  ];

  async extract(crawlResult: CrawlResult): Promise<Sponsor[]> {
    const sponsors: Sponsor[] = [];
    const timestamp = new Date().toISOString();

    // Strategy 1: Look for logo images based on URLs/alt-text + Physical dimensions
    const likelyLogos = crawlResult.images.filter(img => {
      const urlLower = img.url.toLowerCase();
      const altLower = img.alt.toLowerCase();
      const { width, height } = img.dimensions || { width: 0, height: 0 };
      
      const hasKeyword = this.logoKeywords.some(keyword => 
        urlLower.includes(keyword) || altLower.includes(keyword)
      );

      if (!hasKeyword) return false;

      if (width > 0 && height > 0) {
        if (width < 30 || height < 30) return false; 
        if (width > 1200) return false; 
        const aspect = width / height;
        if (aspect < 0.2 || aspect > 10) return false; 
      }

      return true;
    });

    for (const logo of likelyLogos) {
      // Use Gemini to identify the sponsor from the logo URL (only if API key is present)
      let detectedName = logo.alt || 'Unknown (Logo Only)';
      let detectedCategory = 'Other';

      const aiResult = await this.gemini.identifySponsorFromLogo(logo.url);
      if (aiResult && aiResult.name !== 'Unknown') {
          detectedName = aiResult.name;
          detectedCategory = aiResult.category;
      }

      const normalizedName = DataNormalizer.normalizeSponsorName(detectedName);

      sponsors.push({
        hackathon_url: crawlResult.url,
        sponsor_name: normalizedName,
        sponsor_type: 'logo',
        source: 'image_detection_ai',
        logo_url: logo.url,
        logo_alt: logo.alt,
        category: detectedCategory,
        timestamp
      });
    }

    // Strategy 2: Higher prioritizing for college domains
    const isCollegeDomain = !!crawlResult.url.match(/\.(edu|ac\.in|edu\.in)/i);
    const sourceTag = isCollegeDomain ? 'college_matching' : 'text_matching';

    const lines = crawlResult.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (this.sponsorKeywords.some(k => line.includes(k))) {
            const contextLine = lines[i];
            const nextLine = lines[i+1] || '';
            if (nextLine && nextLine.length > 2 && nextLine.length < 100) {
                const normalizedName = DataNormalizer.normalizeSponsorName(nextLine);
                const category = await this.gemini.categorizeTextSponsor(normalizedName);
                
                sponsors.push({
                   hackathon_url: crawlResult.url,
                   sponsor_name: normalizedName,
                   sponsor_type: 'text',
                   category: category,
                   source: sourceTag,
                   timestamp
                });
            }
        }
    }

    return DataNormalizer.deduplicate(sponsors);
  }
}
