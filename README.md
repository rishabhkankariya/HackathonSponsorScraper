# Hackathon Sponsor Scraping System

A scalable system to collect 20,000+ hackathon sponsors from various sources using Playwright and AI.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Chrome (automatically installed via Playwright)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY` (required for Phase 3).
4. Run the scraper:
   ```bash
   npm run dev
   ```

### Running Tests
```bash
npm test
```

## 🎯 Features (Phase 1 Complete)
- [x] **Google Scraping**: Automated queries with pagination support.
- [x] **Website Crawling**: Playwright-based crawling with auto-scrolling for lazy loading.
- [x] **Sponsor Detection**: Keyword-based extraction for text and logos.
- [x] **Data Storage**: CSV persistence with daily append support.

## 🗺️ Roadmap
- **Phase 1**: Discovery & Crawling Foundation (✅ Done)
- **Phase 2**: Advanced Detection & Prioritization (Maharashtra/India focus)
- **Phase 3**: AI-Powered Cleaning & Logo Recognition (Gemini Integration)
- **Phase 4**: Scaling, Batching, and Monitoring

## 📊 Output
All sponsors are saved in `data/sponsors.csv`.

---
*Built with ❤️ for hackathon communities.*
