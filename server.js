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

// Initialize and start server
ensureDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Mental Warehouse server running at http://localhost:${PORT}`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
