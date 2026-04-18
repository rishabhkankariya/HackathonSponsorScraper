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

## ⚙️ System Architecture
The system follows a modular pipeline architecture designed for high scalability:
1.  **Discovery Layer**: Dynamic query expansion to find 1000s of potential hackathon event URLs via Google Search.
2.  **Crawler Layer**: Parallelized Playwright-based browser workers with auto-scrolling to handle JavaScript-heavy and lazy-loaded sites.
3.  **Extraction Layer**: Hybrid intelligence model using keyword heuristics and **Google Gemini 1.5 Flash Vision** for logo-to-brand identification.
4.  **Processing Layer**: Advanced normalization (legal suffix removal) and cross-event deduplication.
5.  **Storage Layer**: Incremental CSV persistence with real-time operational logging.

## 📈 Scalability & Performance
- **Parallel Workers**: Configurable concurrency pool (default 5 workers).
- **Batch Processing**: Designed to handle batches of 100-1000 URLs.
- **Monitoring**: Built-in metrics for "Sponsors per URL" efficiency and error rate tracking.
- **Anti-Blocking**: Randomized delays and user-agent rotation to maintain crawler stability.

## 🛠️ Technology Stack
- **Node.js**: Underlying runtime.
- **TypeScript**: Typed logic for data integrity.
- **Playwright**: Browser automation and DOM inspection.
- **Google Gemini**: AI-powered logo vision and categorization.
- **Zod**: Runtime schema validation.

