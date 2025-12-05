const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large base64 images
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get data from a specific collection
app.get('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, return empty array
        res.json([]);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save all collections atomically (called from dashboard "Save Locally")
app.post('/api/save-all', async (req, res) => {
  try {
    const allData = req.body; // { movies, journal, rules, misc, ... }
    const results = {};
    
    for (const [collection, data] of Object.entries(allData)) {
      if (Array.isArray(data)) {
        const filePath = path.join(DATA_DIR, `${collection}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        results[collection] = { success: true };
      }
    }
    
    // Auto-regenerate data.js after saving all collections
    await regenerateDataJs();
    
    res.json({ success: true, saved: results });
  } catch (err) {
    console.error('POST /api/save-all error:', err);
    res.status(500).json({ error: 'Failed to save all data' });
  }
});

// Regenerate js/data.js from current data files
async function regenerateDataJs() {
  try {
    const collections = ['movies', 'journal', 'rules', 'misc'];
    const staticData = {};
    
    for (const collection of collections) {
      const filePath = path.join(DATA_DIR, `${collection}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        staticData[collection] = JSON.parse(data);
      } catch (err) {
        if (err.code === 'ENOENT') {
          staticData[collection] = collection === 'movies' || collection === 'rules' ? [] : [];
        } else {
          throw err;
        }
      }
    }
    
    const jsContent = `// Static data bundle - used when fetch fails (e.g., file:// protocol)
// Auto-generated from data/*.json on each save
const staticData = ${JSON.stringify(staticData, null, 2)};
`;
    
    const jsFilePath = path.join(__dirname, 'js', 'data.js');
    await fs.writeFile(jsFilePath, jsContent, 'utf8');
    console.log('✅ Regenerated js/data.js');
    return true;
  } catch (err) {
    console.error('Failed to regenerate data.js:', err);
    return false;
  }
}

// Endpoint to regenerate data.js (must be before :collection route)
app.post('/api/regenerate-data', async (req, res) => {
  try {
    const success = await regenerateDataJs();
    res.json({ success });
  } catch (err) {
    console.error('POST /api/regenerate-data error:', err);
    res.status(500).json({ error: 'Failed to regenerate data.js' });
  }
});

// Save data to a specific collection
app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});
ensureDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Mental Warehouse server running at http://localhost:${PORT}`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
