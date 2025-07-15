const { createServer } = require('http')
const { parse } = require('url')
const path = require('path')
const fs = require('fs')

const port = process.env.PORT || 3000
const hostname = '0.0.0.0' // Changed to bind to all interfaces for Azure

console.log(`Starting server on ${hostname}:${port}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`Working directory: ${process.cwd()}`)
console.log(`Files in current directory: ${fs.readdirSync('.').join(', ')}`)

// Check if we have a standalone build
const standaloneServerPath = path.join('.next', 'standalone', 'server.js')
const hasStandalone = fs.existsSync(standaloneServerPath)

if (hasStandalone && process.env.NODE_ENV === 'production') {
  console.log('Using Next.js standalone build')
  // For standalone build, we need to set the current directory
  process.chdir(path.join('.next', 'standalone'))
  require('./server.js')
} else {
  console.log('Using Next.js regular mode')
  const next = require('next')
  
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })
      .once('error', (err) => {
        console.error(err)
        process.exit(1)
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  })
}
