# GeoGrid Local Rank Tracker — v1.2

React + Vite local SEO GeoGrid tracker.

## Campaign and scan functions
- Create, switch, rename and delete campaigns.
- Add multiple business locations to a campaign; edit each location's settings or remove locations.
- Campaign-level default scan settings for newly added locations.
- Per-location business name, target keyword, address, map-centre latitude/longitude, grid size, radius, radius unit, keyword type and selected platforms.
- Grid sizes: 3x3, 5x5, 7x7, 9x9, 11x11, 13x13, 15x15, 17x17, 19x19 and 21x21.
- Scan radius in kilometres or miles. The grid's outermost points are placed at the selected radius from the centre along the grid axes.
- Platform settings: Google Maps, Apple Maps, Bing, Google AI Overviews, ChatGPT and Gemini.
- Keyword types: Traditional Search, AI Platforms, or Traditional + AI Platforms.
- Manual rank entry on the map, Average Map Rank, Top 3 coverage and Top 10 positions.
- CSV import/export, text report export and browser-local scan history.
- Attempts to migrate the earlier `geogrid-tracker-v1` local browser data on first load.

## Important limitations
Platform and keyword selections are campaign settings only. This build does not automatically query Google, Apple, Bing or AI platforms. Ranking positions are manually entered or CSV imported. Automatic scanning requires a supported ranking-data provider/API, backend integration, and any necessary paid account. Data is saved in the current browser's localStorage; it is not synced between devices or users.

## Run locally
1. Install Node.js LTS.
2. Extract this ZIP.
3. Open a terminal in the extracted project folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL shown by Vite.

## Build
Run `npm run build`. Vite creates the `dist` folder.

## Cloudflare
The project files (`package.json`, `vite.config.js`, `index.html`, `src/`) must be together inside the repository's `geogrid-rank-tracker` folder.
- Cloudflare Root directory: `geogrid-rank-tracker`
- Build command: `npm run build`
- Build output directory: `dist`
Deployment configuration updated for v1.2.
