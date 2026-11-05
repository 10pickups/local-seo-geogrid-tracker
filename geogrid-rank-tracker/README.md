# GeoGrid Local Rank Tracker — v1.0

A React + Vite starter app for manually recording local search ranking positions on a geographic grid.

## What's included
- Business, keyword, location and grid settings
- OpenStreetMap map with generated 3x3, 5x5 or 7x7 grid points
- Manual ranking entry for each point
- Average rank, Top 3 coverage and Top 10 metrics
- Save scan snapshots to browser-local history
- CSV import/export and text report export
- Responsive dashboard

## Important data limitation
This version does **not** automatically query Google Maps or retrieve live ranking positions. Ranking values are manually entered or imported from a CSV file. OpenStreetMap is used only to display the map. Do not present manual values as verified live Google Maps data.

## Run locally
1. Install Node.js (LTS).
2. Extract this ZIP.
3. Open a terminal in the extracted `geogrid-rank-tracker` folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Build for hosting
Run `npm run build`. Upload the generated `dist` folder to a static host such as Vercel or Netlify.

## CSV format
Export a sample CSV from the app first. The expected columns are:
`point_id,latitude,longitude,rank`

The app stores project details, points and history in the current browser's localStorage. Clearing browser data will remove that local data. This is a single-browser prototype, not a multi-user cloud application yet.

## Next development phase
- Supabase authentication and cloud database
- Scheduled scans through a compliant local rank data provider
- Multiple business projects and user accounts
- PDF report generation and white-label branding
