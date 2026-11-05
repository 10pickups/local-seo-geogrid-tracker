# GeoGrid Local Rank Tracker — v1.1

React + Vite local SEO GeoGrid tracker.

## v1.1 features
- Campaign management: create and switch between campaigns.
- Multiple business locations inside each campaign.
- Per-location keyword, address, coordinates and grid settings.
- Grid sizes: 3x3 through 21x21.
- Scan radius with kilometres or miles.
- Platform preferences: Google Maps, Apple Maps, Bing, Google AI Overviews, ChatGPT and Gemini.
- Keyword type: Traditional Search, AI Platforms, or Traditional + AI Platforms.
- Manual ranking entry, ranking map, Average Map Rank, Top 3 and Top 10 metrics.
- CSV import/export, text report export and browser-local scan history.
- Migrates the earlier v1 browser data when available.

## Important limitations
Platform choices are campaign configuration only. This version does not automatically query Google, Apple, Bing or AI platforms. Rankings remain manually entered or CSV imported. Automatic scanning needs a suitable data provider, backend and separate integration. Data is stored in the current browser using localStorage; it is not yet synced between devices or users.

## Run locally
1. Install Node.js LTS.
2. Extract this ZIP.
3. Open a terminal in the extracted project folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL shown by Vite.

## Build
Run `npm run build`. Vite creates the `dist` folder.

## Cloudflare Pages
- Root directory: `/` (the project package.json is at the project root).
- Build command: `npm run build`
- Build output directory: `dist`

If you keep this folder nested inside a GitHub repository, set Cloudflare Root directory to the nested project folder name instead.
