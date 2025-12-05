# The Mental Warehouse

A personal creative operations hub for tracking movies, journal entries, rules, and notes.

## Features

- **Movies Log**: Track movies watched with ratings, dates, and locations
- **Journal**: Personal journal with photos and location tags
- **Games**: Two-player games (Tic-Tac-Toe, Rock-Paper-Scissors) with WebRTC
- **Rules**: Simple rules tracker
- **Notes**: Quick notes with optional images

## Setup

### Install Dependencies

```bash
npm install
```

### Migrate Existing Data (First Time Only)

If you have data in localStorage from the previous version:

1. Open `migrate.html` in your browser
2. Click "Extract localStorage Data"
3. Copy each JSON block and save to the corresponding file in `data/`
4. Or manually copy the JSON to each file:
   - `data/movies.json`
   - `data/journal.json`
   - `data/rules.json`
   - `data/misc.json`

### Start the Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## Data Storage

All data is now stored in JSON files in the `data/` folder:
- `data/movies.json` - Movie entries
- `data/journal.json` - Journal entries
- `data/rules.json` - Rules
- `data/misc.json` - Notes

Each file contains an array of objects. Data persists across sessions and can be easily backed up, versioned, or synced.

## Development

The server (`server.js`) provides two API endpoints:
- `GET /api/:collection` - Retrieve data for a collection
- `POST /api/:collection` - Save data for a collection

Static files (HTML, CSS, JS) are served from the root directory.

## Deployment

For production deployment:
1. Commit the `data/` folder with your content
2. Deploy to a Node.js hosting service (Vercel, Render, Railway, etc.)
3. Ensure the server can write to the `data/` directory

## License

MIT
