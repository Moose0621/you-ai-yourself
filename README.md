# Phish Statistics Dashboard

A modern web application for exploring Phish song statistics, tour data, and performance analytics using the Phish.net API with interactive circular tour visualizations and comprehensive data analysis tools.

## ✨ Features

### 📊 Song Statistics
- **Comprehensive Analytics**: Song play counts, average lengths, and gap analysis
- **Longest Jam Tracking**: Historical longest jam performances with dates and venues
- **Interactive Filtering**: Search and filter by song name, length, play count
- **Smart Autocomplete**: Intelligent song suggestions with metadata

### 🎪 Tours Explorer
- **Interactive Circular Visualization**: Tour data displayed in engaging circular layouts
- **Year-by-Year Navigation**: Explore Phish's touring history by year
- **Hover Tooltips**: Detailed tour information on hover
- **Show Details**: Click-through to individual show listings
- **Size-Coded Tours**: Visual representation of tour sizes by show count

### 🎯 Modern UI/UX
- **Tabbed Navigation**: Seamless switching between Statistics and Tours
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Real-time Filtering**: Instant search and filter results
- **Professional Styling**: Clean, modern interface with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- **Node.js 21+** (LTS recommended)
- **Python 3.12+** (for data processing scripts)
- **npm** or **yarn**
- **Phish.net API key** ([Get one here](https://phish.net/api/keys/))

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/Moose0621/you-ai-yourself.git
cd you-ai-yourself

# Install Node.js dependencies
npm install

# Set up Python environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your Phish.net API key

# Generate initial data
npm run data:refresh

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── .github/workflows/     # CI/CD and maintenance workflows
├── .azure/               # Azure deployment configuration
├── scripts/              # Maintenance and data processing scripts
├── src/
│   ├── app/             # Next.js 13+ app directory
│   ├── components/      # React components
│   │   ├── Navigation.tsx      # Tab navigation system
│   │   ├── ToursExplorer.tsx   # Circular tour visualization
│   │   ├── FilterControls.tsx  # Search and filtering
│   │   ├── SongChart.tsx       # Chart components
│   │   ├── SongTable.tsx       # Data table display
│   │   └── TourStats.tsx       # Statistics overview
│   ├── lib/             # API and utility functions
│   │   └── simpleLocalPhishApi.ts  # Enhanced API with tour support
│   └── types/           # TypeScript definitions
├── data/                # Raw and processed data files
├── public/              # Static assets and processed data
├── tests/               # Test suites (Jest & Pytest)
└── backups/             # Automated data backups
```

## 🔧 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # TypeScript type checking
```

### Testing & Quality
```bash
npm run test             # Run Jest tests
npm run test:coverage    # Run tests with coverage
npm run test:python      # Run Python tests
npm run test:all         # Run all tests
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
```

### Data Management
```bash
npm run data:refresh     # Refresh Phish.net data
npm run data:backup      # Create data backup
npm run health-check     # System health check
```

### Maintenance
```bash
npm run clean            # Clean build artifacts
npm run clean:full       # Full clean and reinstall
npm run security:audit   # Security vulnerability scan
npm run deps:check       # Check for outdated dependencies
npm run deps:update      # Update dependencies
```

## 🗄️ Data Architecture

### Data Sources
- **Phish.net API v5**: Live show and song data
- **Local JSON Cache**: Optimized for fast loading
- **Processed Data**: Enhanced with jam analysis and statistics

### Data Processing Pipeline
1. **Fetch**: Download raw data from Phish.net API
2. **Filter**: Remove non-Phish shows and future dates
3. **Enhance**: Add longest jam calculations and metadata
4. **Cache**: Store processed data for fast access
5. **Backup**: Automated daily backups with retention

### Data Structure
```typescript
interface Song {
  name: string
  slug: string
  timesPlayed: number
  averageLength: number
  longestJam?: JamPerformance
  tags: string[]
}

interface Show {
  showid: number
  date: string
  venue: string
  city: string
  state: string | null
  country: string
  tourid?: number
  tour_name?: string
}
```

## 🏗️ API Integration

### Enhanced Local API
The application uses an enhanced local API that provides:

```typescript
// Song statistics and search
getSongStats(): Promise<Song[]>
searchSongs(query: string): Promise<Song[]>
getTopSongsByLongestJam(limit?: number): Promise<Song[]>

// Tour exploration
getToursByYear(): Promise<Record<number, Tour[]>>
getAvailableYears(): Promise<number[]>
getShowsByYear(year: number): Promise<Show[]>

// Utility methods
getMetadata(): Promise<Metadata>
getAllTags(): Promise<string[]>
```

### Phish.net API Endpoints
- `GET /v5/shows.json` - All shows
- `GET /v5/songs.json` - Song catalog
- `GET /v5/shows/year/{year}.json` - Shows by year
- `GET /v5/songdata/slug/{slug}.json` - Detailed song data

## 🎨 UI Components

### Navigation System
- **Tab-based Interface**: Smooth transitions between sections
- **Active State Indicators**: Clear visual feedback
- **Mobile Responsive**: Collapsible navigation on small screens

### Tours Explorer
- **Circular Layout**: Tours arranged in visually appealing circles
- **Interactive Elements**: Hover effects and click handlers
- **Color Coding**: Unique colors for each tour
- **Size Scaling**: Circle size represents tour magnitude

### Smart Search
- **Autocomplete**: Real-time suggestions as you type
- **Rich Previews**: Show metadata in suggestions
- **Intelligent Sorting**: Exact matches and starts-with prioritized

## 🚢 Deployment

### Azure Web App Deployment

#### Prerequisites
- Azure subscription
- Azure CLI installed
- GitHub repository with secrets configured

#### Required Secrets
```bash
AZURE_WEBAPP_NAME              # Production app name
AZURE_WEBAPP_PUBLISH_PROFILE   # Production publish profile
AZURE_WEBAPP_NAME_STAGING      # Staging app name
AZURE_WEBAPP_PUBLISH_PROFILE_STAGING  # Staging publish profile
AZURE_STORAGE_ACCOUNT          # Storage account for backups
AZURE_STORAGE_KEY              # Storage account key
```

#### Deployment Process
1. **Automatic**: Push to `main` triggers production deployment
2. **Staging**: Push to `develop` deploys to staging environment
3. **Manual**: Use GitHub Actions workflow dispatch

### CI/CD Pipeline
- **Quality Gates**: Automated testing, linting, type checking
- **Security Scanning**: Dependency vulnerability checks
- **Health Monitoring**: Post-deployment verification
- **Automated Backups**: Daily data backups to Azure Storage

## 🧪 Testing

### Test Coverage
- **Frontend**: Jest + React Testing Library
- **Backend**: Python pytest with coverage
- **Integration**: End-to-end API testing
- **Quality**: ESLint, TypeScript strict mode

### Running Tests
```bash
# Quick test run
npm test

# Full test suite with coverage
npm run test:all

# Python-specific tests
npm run test:python

# Watch mode for development
npm run test:watch
```

## 🔒 Security

### Security Measures
- **API Key Protection**: Environment variable security
- **Dependency Scanning**: Automated vulnerability detection
- **Content Security**: Input validation and sanitization
- **HTTPS Only**: Secure communication protocols

### Security Scripts
```bash
npm run security:audit    # Check for vulnerabilities
npm run security:fix      # Auto-fix security issues
```

## 📈 Monitoring & Maintenance

### Automated Maintenance
- **Daily Health Checks**: System integrity verification
- **Weekly Dependency Updates**: Automated security patches
- **Data Freshness Monitoring**: Automatic data refresh
- **Performance Monitoring**: Response time tracking

### Health Monitoring
```bash
npm run health-check      # Manual health check
```

### Backup Strategy
- **Daily Backups**: Automated data preservation
- **7-day Retention**: Local backup cleanup
- **Cloud Storage**: Azure Blob Storage integration
- **Recovery Testing**: Periodic backup validation

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code quality
- **Prettier**: Consistent formatting
- **Conventional Commits**: Structured commit messages

### Testing Requirements
- **Unit Tests**: Required for new components
- **Integration Tests**: Required for API changes
- **Coverage**: Minimum 80% coverage threshold
- **Type Safety**: No TypeScript errors allowed

## 📊 Performance

### Optimization Features
- **Static Generation**: Pre-built pages for faster loading
- **Data Caching**: Local JSON cache for instant access
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js automatic optimization

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🐛 Troubleshooting

### Common Issues

#### Data Loading Issues
```bash
# Refresh data cache
npm run data:refresh

# Check health status
npm run health-check

# Clear cache and rebuild
npm run clean:full
```

#### Development Issues
```bash
# Type checking errors
npm run type-check

# Linting issues
npm run lint:fix

# Test failures
npm run test:coverage
```

#### Deployment Issues
```bash
# Check build locally
npm run build

# Verify environment variables
cat .env.local

# Test production build
npm run start
```

## 📝 Changelog

### Version 0.2.0 (Latest)
- ✨ Added interactive Tours Explorer with circular visualization
- 🔍 Enhanced search with autocomplete functionality
- 🎪 Year-by-year tour navigation
- 📊 Improved data processing and caching
- 🏗️ Complete CI/CD pipeline setup
- 🔧 Comprehensive maintenance scripts

### Version 0.1.0
- 🎵 Basic song statistics and filtering
- 📈 Chart.js integration for data visualization
- 🎯 Responsive design with Tailwind CSS
- 🔌 Phish.net API integration
- ✅ Initial test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Phish.net](https://phish.net)** and the **Mockingbird Foundation** for providing comprehensive Phish data
- **The Phish Community** for ongoing documentation and preservation efforts
- **Contributors** to the open-source packages that make this project possible

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **API Documentation**: [Phish.net API](https://phish.net/api/)
- **Issue Tracker**: [GitHub Issues](https://github.com/Moose0621/you-ai-yourself/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Moose0621/you-ai-yourself/discussions)

---

**Built with ❤️ for the Phish community**
