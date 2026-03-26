import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } else {
      console.warn('Gemini API key not found. AI features will be mocked.');
    }
  }

  async identifySponsorFromLogo(logoUrl: string): Promise<{ name: string; category: string } | null> {
    if (!this.model) {
      // Mocked logic for fallback
      return null;
    }

    try {
      const prompt = `Identify the company name from this logo URL: ${logoUrl}. 
      Also categorize them into one of: AI, Web3, SaaS, Cloud, EdTech, Fintech, Healthcare, or Other.
      Format the response as JSON: { "name": "Google", "category": "AI" }
      If you can't identify it, return { "name": "Unknown", "category": "Other" }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Basic JSON parsing from the model's output
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
         return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Gemini error identifying logo:', error);
      return null;
    }
  }

  async categorizeTextSponsor(sponsorName: string): Promise<string> {
    if (!this.model) return 'Other';
    
    try {
      const prompt = `Categorize this sponsor name into one of: AI, Web3, SaaS, Cloud, EdTech, Fintech, Healthcare, or Other.
      Sponsor Name: ${sponsorName}
      Return only the category name.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch {
      return 'Other';
    }
  }
}
