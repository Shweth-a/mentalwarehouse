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

## Modes

- **GitHub Pages (static, read-only):** The site fetches data from `data/*.json`. Adding/editing via the UI will be ignored because static hosting cannot write files. Update data by editing the JSON files and `git push`.
- **Local dev (read/write):** Run the dev server to read/write JSON files in `data/`.

### Local Dev (read/write)

```bash
npm install
npm start
```

Open `http://localhost:3000`. Adds/edits/deletes persist to `data/*.json` via the dev API. Commit and push the updated `data/` folder to publish changes.

### Static (GitHub Pages) behavior

- Data loads from `data/*.json` in the repo.
- Save/Delete is a no-op on GitHub Pages (read-only). To change data on the live site, edit `data/*.json` locally (or through the dev server), then `git push`.

## Data Files

- `data/movies.json` - Movie entries
- `data/journal.json` - Journal entries
- `data/rules.json` - Rules
- `data/misc.json` - Notes

## API (dev server)

- `GET /api/:collection` - Retrieve data for a collection
- `POST /api/:collection` - Save data for a collection

Static assets are served from the project root.

## License

MIT
