# Phish Stats - Song Statistics & Analytics Dashboard

[![Build and Release Container](https://github.com/Moose0621/you-ai-yourself/actions/workflows/release.yml/badge.svg)](https://github.com/Moose0621/you-ai-yourself/actions/workflows/release.yml)
[![CI/CD Pipeline](https://github.com/Moose0621/you-ai-yourself/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Moose0621/you-ai-yourself/actions/workflows/ci-cd.yml)

A comprehensive web application for exploring Phish song statistics, performance analytics, and tour data. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🎵 Features

### Statistics Dashboard
- **Song Analytics**: Comprehensive statistics for all Phish songs including play counts, average lengths, and longest jam versions
- **Advanced Filtering**: Filter by song length, search terms, and custom tags
- **Sortable Columns**: Click any column header to sort by that metric
- **Interactive Charts**: Visual representations of most played songs and longest jams

### Tours Explorer
- **Circular Visualization**: Interactive circular chart showing tours by year
- **Tour Details**: Click on any tour to see detailed information
- **Historical Data**: Complete tour history with show counts and date ranges

### Enhanced User Experience
- **Real-time Search**: Autocomplete search functionality for finding songs quickly
- **Tag Filtering**: Click on song tags to filter the results
- **Cross-browser Compatibility**: Optimized for Safari, Chrome, Firefox, and Edge
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Running with Docker

```bash
# Pull and run the latest release
docker run -p 8080:8080 ghcr.io/moose0621/you-ai-yourself:latest

# Or run a specific version
docker run -p 8080:8080 ghcr.io/moose0621/you-ai-yourself:v0.1.0
```

Visit `http://localhost:8080` to access the application.

### Local Development

```bash
# Clone the repository
git clone https://github.com/Moose0621/you-ai-yourself.git
cd you-ai-yourself

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Container Images

Container images are automatically built and published to GitHub Container Registry:

- **Latest**: `ghcr.io/moose0621/you-ai-yourself:latest`
- **Versioned**: `ghcr.io/moose0621/you-ai-yourself:v0.1.0`

### Multi-platform Support
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (Apple Silicon, ARM64)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Server port | `8080` |
| `PHISH_NET_API_KEY` | Optional: phish.net API key for live data | - |

### Azure App Service Deployment

The application is optimized for Azure App Service deployment:

```bash
# Deploy using the provided scripts
./scripts/azure-setup.sh      # Create Azure resources
./scripts/azure-deploy.sh     # Deploy the application
./scripts/azure-configure.sh  # Configure app settings
```

## 📊 Data Source

- **Primary**: Local JSON cache of processed phish.net data
- **Scope**: Historical Phish performances (excludes solo band member shows)
- **Updates**: Data can be refreshed using the Python data collection script
- **Coverage**: Complete song and show history through current date

### Data Processing

```bash
# Update local data cache (requires Python 3.12+)
cd scripts
python3 fetch_phish_data.py
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Charts**: Custom React components
- **Testing**: Jest with React Testing Library
- **Data Processing**: Python 3.12 with requests library
- **Deployment**: Docker, Azure App Service
- **CI/CD**: GitHub Actions

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:coverage` - Generate coverage report

### Maintenance
- `node scripts/health-check.mjs` - System health validation
- `node scripts/backup-data.mjs` - Data backup utility

### Azure Operations
- `./scripts/azure-setup.sh` - Initial Azure resource setup
- `./scripts/azure-deploy.sh` - Deploy to Azure App Service
- `./scripts/azure-configure.sh` - Configure Azure settings
- `./scripts/azure-manage.sh` - Management operations

## 🔍 API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/test-songs` - Sample song data (development)
- `GET /api/test-local-data` - Data validation endpoint

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run Python data tests
cd scripts && python -m pytest
```

## 📈 Performance

- **Bundle Size**: Optimized with Next.js tree shaking
- **Loading**: Lazy loading for non-critical components
- **Caching**: Local JSON cache for fast data access
- **Browser Support**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

## 🚀 Deployment

### Container Deployment

```bash
# Build local image
docker build -t phish-stats .

# Run locally
docker run -p 8080:8080 phish-stats
```

### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name phish-stats \
  --image ghcr.io/moose0621/you-ai-yourself:latest \
  --ports 8080 \
  --environment-variables NODE_ENV=production
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phish-stats
spec:
  replicas: 2
  selector:
    matchLabels:
      app: phish-stats
  template:
    metadata:
      labels:
        app: phish-stats
    spec:
      containers:
      - name: phish-stats
        image: ghcr.io/moose0621/you-ai-yourself:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **phish.net** - For providing the comprehensive Phish performance database
- **Phish** - For decades of incredible music and jamming
- **The Phish Community** - For maintaining detailed show and song information

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Moose0621/you-ai-yourself/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Moose0621/you-ai-yourself/discussions)

---

Built with ❤️ for the Phish community
