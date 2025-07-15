const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Azure requires binding to all interfaces
const port = process.env.PORT || 8080;

console.log(`🚀 Starting Phish Stats Server (Azure Compatible)`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${port}`);
console.log(`Development mode: ${dev}`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Files in directory:`, require('fs').readdirSync('.'));

// Check if Next.js build exists
const fs = require('fs');
if (!fs.existsSync('.next')) {
  console.error('❌ .next directory not found! Make sure the app is built.');
  console.log('Available files:', fs.readdirSync('.'));
  process.exit(1);
}

console.log('✅ .next directory found');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Health check endpoint for Azure
      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          port: port,
          env: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
          nextReady: true
        }));
        return;
      }

      // Let Next.js handle all other routes
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`🎉 Server ready on http://${hostname}:${port}`);
    console.log(`📊 Health check: http://${hostname}:${port}/health`);
  });
}).catch((ex) => {
  console.error('Error starting Next.js app:', ex);
  console.error(ex.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
