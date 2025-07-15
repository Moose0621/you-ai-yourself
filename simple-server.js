const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

console.log('Starting simple Express server...');
console.log('PORT:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Working directory:', process.cwd());
console.log('Files in directory:', fs.readdirSync('.').filter(f => !f.startsWith('.')).join(', '));

// Serve static files from public directory
app.use('/public', express.static('public'));
app.use('/_next/static', express.static('.next/static'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: port,
    env: process.env.NODE_ENV 
  });
});

// API endpoints
app.get('/api/test-songs', (req, res) => {
  try {
    const songsPath = path.join('public', 'songs.json');
    if (fs.existsSync(songsPath)) {
      const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
      res.json({ songs: songs.slice(0, 10), total: songs.length });
    } else {
      res.json({ songs: [], total: 0, error: 'Songs file not found' });
    }
  } catch (error) {
    console.error('Error loading songs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-local-data', (req, res) => {
  try {
    const dataPath = path.join('public', 'processed-data.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      res.json({ 
        songsCount: data.songs?.length || 0,
        showsCount: data.shows?.length || 0,
        status: 'success'
      });
    } else {
      res.json({ error: 'Processed data file not found' });
    }
  } catch (error) {
    console.error('Error loading processed data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phish Stats - Server Running</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 10px; border-radius: 4px; margin: 20px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; border-radius: 4px; margin: 20px 0; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul { list-style-type: none; padding: 0; }
        li { padding: 8px; border-bottom: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎵 Phish Stats Application</h1>
        <div class="status">
          ✅ Server is running successfully on Azure App Service!
        </div>
        
        <h2>Server Information</h2>
        <ul>
          <li><strong>Port:</strong> ${port}</li>
          <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          <li><strong>Working Directory:</strong> ${process.cwd()}</li>
        </ul>

        <h2>Available Endpoints</h2>
        <ul>
          <li><a href="/health">🔍 Health Check</a></li>
          <li><a href="/api/test-songs">🎵 Test Songs API</a></li>
          <li><a href="/api/test-local-data">📊 Test Local Data API</a></li>
        </ul>

        <h2>Next Steps</h2>
        <p>This confirms that the Node.js server is working correctly on Azure App Service. The Next.js application can now be properly configured to run on this infrastructure.</p>
        
        <div class="status">
          <strong>Deployment Status:</strong> Basic server successfully deployed and responding on port ${port}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Catch all other routes
app.get('*', (req, res) => {
  res.status(404).send(`
    <h1>404 - Not Found</h1>
    <p>Path: ${req.path}</p>
    <p><a href="/">← Back to Home</a></p>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  console.log(`✅ Health check available at http://0.0.0.0:${port}/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
