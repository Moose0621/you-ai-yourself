# Phish Statistics Dashboard

A modern web application for exploring Phish song statistics, tour data, and performance analytics using the Phish.net API.

## Features

- **Tour Statistics**: Overview of current tour shows and song data
- **Song Analytics**: Comprehensive statistics including play counts, average lengths, and gaps
- **Interactive Filtering**: Sort and filter songs by various criteria
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Phish.net API key (get one at [https://phish.net/api/keys/](https://phish.net/api/keys/))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd you-ai-yourself
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Phish.net API key:
```
NEXT_PUBLIC_PHISH_API_KEY=your_actual_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                # Next.js 13+ app directory
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/        # React components
│   ├── FilterControls.tsx
│   ├── LoadingSpinner.tsx
│   ├── SongChart.tsx
│   ├── SongTable.tsx
│   └── TourStats.tsx
├── lib/              # Utility functions and API
│   └── phishApi.ts   # Phish.net API integration
└── types/            # TypeScript type definitions
    └── phish.ts      # Phish-related types
```

## API Integration

This application integrates with the Phish.net API v5. The API provides access to:

- Show data and setlists
- Song statistics and history
- Venue information
- Tour data

### Sample API Endpoints

- `GET /v5/shows/recent.json` - Recent shows
- `GET /v5/songs.json` - Song list
- `GET /v5/songdata/slug/{song-slug}.json` - Detailed song data
- `GET /v5/shows/year/{year}.json` - Shows by year

## Development

### Current Implementation

The application currently uses sample data for demonstration purposes. To integrate with real API data:

1. Ensure you have a valid API key
2. Modify the `phishApi.ts` file to uncomment the actual API calls
3. Update the sample data sections with real API integration

### Adding Features

Some ideas for additional features:

- **Show Details**: Click through to individual show pages
- **Venue Analytics**: Statistics by venue or city
- **Jam Charts**: Integration with Phish.net jam charts
- **Set Analysis**: Breakdown of set structures and song positions
- **Gap Analysis**: Detailed analysis of song gaps and debuts
- **Comparison Tools**: Compare different tours or time periods

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React 18**: UI library with hooks and modern features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and non-commercial use. Phish.net data is provided by the Mockingbird Foundation under their terms of use.

## Acknowledgments

- [Phish.net](https://phish.net) and the Mockingbird Foundation for providing the API and data
- The Phish community for their ongoing documentation and preservation efforts
