const express = require('express');
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Azure requires binding to all interfaces
const port = process.env.PORT || 3000;

console.log(`🚀 Starting Phish Stats Server`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${port}`);
console.log(`Development mode: ${dev}`);
console.log(`Working directory: ${process.cwd()}`);

const app = express();

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: port,
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API endpoints for Phish data
app.get('/api/test-songs', (req, res) => {
  try {
    const songsPath = path.join('public', 'songs.json');
    if (fs.existsSync(songsPath)) {
      const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
      res.json({ 
        songs: songs.slice(0, 10), 
        total: songs.length,
        status: 'success'
      });
    } else {
      res.json({ 
        songs: [], 
        total: 0, 
        error: 'Songs file not found',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error loading songs:', error);
    res.status(500).json({ 
      error: error.message,
      status: 'error'
    });
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
        status: 'success',
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({ 
        error: 'Processed data file not found',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error loading processed data:', error);
    res.status(500).json({ 
      error: error.message,
      status: 'error'
    });
  }
});

// In production on Azure, serve the built Next.js app
if (!dev) {
  console.log('🏗️  Production mode: Setting up Next.js static serving');
  
  // Serve Next.js static files
  app.use('/_next/static', express.static('.next/static'));
  
  // Check for and serve Next.js build
  if (fs.existsSync('.next')) {
    console.log('✅ Found .next directory');
    
    // Try to serve standalone build if available
    if (fs.existsSync('.next/standalone')) {
      console.log('✅ Using Next.js standalone build');
      try {
        const nextApp = require('./.next/standalone/server.js');
      } catch (error) {
        console.warn('⚠️  Could not load standalone server:', error.message);
      }
    }
  }
  
  // Fallback: serve a basic app page
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Phish Stats - Live on Azure</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
          }
          .container { 
            max-width: 800px; background: rgba(255,255,255,0.1); padding: 40px; 
            border-radius: 20px; backdrop-filter: blur(10px); text-align: center;
            box-shadow: 0 25px 45px rgba(0,0,0,0.1);
          }
          .status { 
            background: rgba(40,167,69,0.2); border: 2px solid rgba(40,167,69,0.5); 
            padding: 20px; border-radius: 10px; margin: 20px 0;
          }
          .logo { font-size: 4em; margin-bottom: 20px; }
          h1 { margin: 0 0 20px 0; font-size: 2.5em; }
          a { 
            color: #ffd700; text-decoration: none; padding: 10px 20px; 
            background: rgba(255,215,0,0.2); border-radius: 5px; margin: 5px;
            display: inline-block; transition: all 0.3s ease;
          }
          a:hover { background: rgba(255,215,0,0.3); transform: translateY(-2px); }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
          .card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🎵</div>
          <h1>Phish Stats</h1>
          <div class="status">
            ✅ Successfully running on Azure App Service!
          </div>
          
          <div class="grid">
            <div class="card">
              <h3>🔍 Health Check</h3>
              <a href="/health">System Status</a>
            </div>
            <div class="card">
              <h3>🎵 Songs API</h3>
              <a href="/api/test-songs">Test Songs</a>
            </div>
            <div class="card">
              <h3>📊 Data API</h3>
              <a href="/api/test-local-data">Test Data</a>
            </div>
          </div>
          
          <p>Server running on port ${port} | Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
        </div>
      </body>
      </html>
    `);
  });
  
} else {
  console.log('🚧 Development mode: Next.js will handle routing');
  
  // In development, let Next.js handle everything except our API routes
  const next = require('next');
  const nextApp = next({ dev, hostname, port });
  const handle = nextApp.getRequestHandler();
  
  nextApp.prepare().then(() => {
    // Let Next.js handle all other routes in development
    app.all('*', (req, res) => {
      return handle(req, res);
    });
  }).catch(error => {
    console.error('Error starting Next.js:', error);
    process.exit(1);
  });
}

// Handle 404s
app.use('*', (req, res) => {
  res.status(404).send(`
    <h1>404 - Not Found</h1>
    <p>Path: ${req.originalUrl}</p>
    <p><a href="/">← Back to Home</a></p>
  `);
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    status: 'error'
  });
});

// Start the server
const server = createServer(app);

server.listen(port, hostname, () => {
  console.log(`🎉 Server ready on http://${hostname}:${port}`);
  console.log(`📊 Health check: http://${hostname}:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
