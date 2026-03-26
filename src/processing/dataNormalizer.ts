import { Sponsor } from '../types/schema';

export class DataNormalizer {
  private static legalSuffixes = [
    ' LLC', ' Ltd', ' L.L.C.', ' Limited', ' Inc.', ' Inc', ' Corporation', ' Corp.', ' Corp',
    ' S.A.', ' S.p.A.', ' Gmbh', ' Pvt. Ltd.', ' Pvt Ltd', ' Private Limited'
  ];

  static normalizeSponsorName(name: string): string {
    let normalized = name.trim();
    
    // 1. Remove legal suffixes
    for (const suffix of this.legalSuffixes) {
      if (normalized.toLowerCase().endsWith(suffix.toLowerCase())) {
        normalized = normalized.slice(0, -suffix.length).trim();
      }
    }

    // 2. Remove trailing special characters often found in scraping
    normalized = normalized.replace(/[,.-]$/, '').trim();

    // 3. Title case for consistency
    normalized = normalized.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return normalized;
  }

  static deduplicate(sponsors: Sponsor[]): Sponsor[] {
    const seen = new Set<string>();
    return sponsors.filter(s => {
      const key = `${s.hackathon_url}|${this.normalizeSponsorName(s.sponsor_name).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
