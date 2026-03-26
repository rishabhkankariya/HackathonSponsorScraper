import { Page } from 'playwright';

export class LinkDiscoverer {
  private sponsorKeywords = [
    'sponsor', 'partner', 'collaborator', 'supporter', 'associate'
  ];

  async findSponsorLinks(page: Page): Promise<string[]> {
    const baseUrl = page.url();
    
    // Find all links that might point to a dedicated sponsor page
    const links = await page.$$eval('a', (elements) => {
      return elements.map(el => ({
        href: (el as HTMLAnchorElement).href,
        text: (el as HTMLAnchorElement).innerText.toLowerCase(),
        title: (el as HTMLAnchorElement).title.toLowerCase()
      }));
    });

    const results = links
      .filter(link => {
        if (!link.href) return false;
        
        // Ensure link is on the same domain or a subdomain
        const currentDomain = new URL(baseUrl).hostname;
        try {
            const linkDomain = new URL(link.href).hostname;
            if (!linkDomain.includes(currentDomain)) return false;
        } catch { return false; }
        
        // Look for keywords in link text or URL
        const textMatch = this.sponsorKeywords.some(k => link.text.includes(k));
        const urlMatch = this.sponsorKeywords.some(k => link.href.toLowerCase().includes(k)); 
        return textMatch || urlMatch;
      })
      .map(link => link.href);

    return Array.from(new Set(results)); // Deduplicate
  }
}
