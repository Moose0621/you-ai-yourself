#!/usr/bin/env python3
"""
Phish Data Downloader - Genuine Data Only
Downloads historical Phish show and song data from phish.net API and stores locally in JSON format.
Uses ONLY genuine data from the API - no synthetic generation.
"""

import os
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Configuration
API_KEY = os.getenv('NEXT_PUBLIC_PHISH_API_KEY')
if not API_KEY:
    raise ValueError("NEXT_PUBLIC_PHISH_API_KEY environment variable is required. Please set it in your .env.local file.")
BASE_URL = 'https://api.phish.net/v5'
DATA_DIR = Path(__file__).parent.parent / 'data'

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

class PhishDataDownloader:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Phish Stats Dashboard/1.0'
        })

    def make_api_request(self, endpoint: str) -> Dict[str, Any]:
        """Make a request to the Phish.net API"""
        url = f"{BASE_URL}{endpoint}"
        params = {'apikey': self.api_key}
        
        print(f"Fetching: {endpoint}")
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('error') and data.get('error') != False:
                raise Exception(f"API Error: {data.get('error_message', 'Unknown error')}")
            
            return data.get('data', data)
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"JSON decode error: {str(e)}")

    def fetch_all_songs(self) -> List[Dict[str, Any]]:
        """Fetch all songs from the API"""
        print("📀 Fetching all songs...")
        try:
            songs = self.make_api_request('/songs')
            
            file_path = DATA_DIR / 'songs.json'
            with open(file_path, 'w') as f:
                json.dump(songs, f, indent=2)
            
            print(f"✅ Saved {len(songs)} songs to {file_path}")
            return songs
            
        except Exception as error:
            print(f"❌ Error fetching songs: {error}")
            return []

    def fetch_all_shows(self) -> List[Dict[str, Any]]:
        """Fetch all shows from the API"""
        print("🎪 Fetching all shows...")
        try:
            all_shows = self.make_api_request('/shows')
            
            # Filter for only Phish shows (not individual band member shows)
            phish_shows = [
                show for show in all_shows 
                if show.get('artistid') == 1 or show.get('artist_name') == 'Phish'
            ]
            
            print(f"📊 Filtered {len(phish_shows)} Phish shows from {len(all_shows)} total shows")
            
            file_path = DATA_DIR / 'shows.json'
            with open(file_path, 'w') as f:
                json.dump(phish_shows, f, indent=2)
            
            print(f"✅ Saved {len(phish_shows)} Phish shows to {file_path}")
            return phish_shows
            
        except Exception as error:
            print(f"❌ Error fetching shows: {error}")
            return []

    def fetch_yearly_shows(self, start_year: int = 1983, end_year: int = None) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch shows organized by year"""
        # Don't fetch shows from the future
        current_year = datetime.now().year
        if end_year is None or end_year > current_year:
            end_year = current_year
            
        print(f"📅 Organizing shows by year ({start_year}-{end_year})...")
        
        # Get all shows first (we already have them from the previous step)
        try:
            # Read from the shows.json file we just created
            shows_file_path = DATA_DIR / 'shows.json'
            if shows_file_path.exists():
                with open(shows_file_path, 'r') as f:
                    all_shows = json.load(f)
                print(f"  Using {len(all_shows)} shows from cache...")
            else:
                print("  No shows cache found, fetching from API...")
                all_shows = self.make_api_request('/shows')
        except Exception as error:
            print(f"  Error loading shows: {error}")
            all_shows = []
        
        yearly_data = {}
        today = datetime.now().strftime('%Y-%m-%d')
        
        for year in range(start_year, end_year + 1):
            print(f"  Organizing year {year}...")
            
            # Filter shows by year, exclude future dates, and ensure only Phish shows
            year_shows = []
            for show in all_shows:
                show_date = show.get('showdate', '')
                is_phish = show.get('artistid') == 1 or show.get('artist_name') == 'Phish'
                
                if show_date and is_phish:
                    try:
                        show_year = datetime.strptime(show_date, '%Y-%m-%d').year
                        if show_year == year and show_date <= today:
                            year_shows.append(show)
                    except ValueError:
                        # Skip shows with invalid dates
                        continue
            
            yearly_data[str(year)] = year_shows
            
            # Save individual year file
            year_file_path = DATA_DIR / f'shows-{year}.json'
            with open(year_file_path, 'w') as f:
                json.dump(year_shows, f, indent=2)
            
            print(f"    ✅ {len(year_shows)} shows in {year}")
        
        # Save combined yearly data
        combined_file_path = DATA_DIR / 'shows-by-year.json'
        with open(combined_file_path, 'w') as f:
            json.dump(yearly_data, f, indent=2)
        
        print(f"✅ Saved yearly shows data to {combined_file_path}")
        return yearly_data

    def fetch_setlists_for_recent_shows(self, shows: List[Dict[str, Any]], limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch setlist data for recent shows"""
        print(f"🎵 Fetching setlists for {limit} recent shows...")
        
        # Filter out shows from the future (beyond today) and ensure only Phish shows
        today = datetime.now().strftime('%Y-%m-%d')
        phish_shows = [
            show for show in shows 
            if (show.get('showdate', '') <= today and 
                (show.get('artistid') == 1 or show.get('artist_name') == 'Phish'))
        ]
        
        print(f"  Filtered to {len(phish_shows)} past/current Phish shows from {len(shows)} total shows")
        
        # Sort shows by date and take the most recent ones
        recent_shows = sorted(phish_shows, key=lambda x: x.get('showdate', ''), reverse=True)[:limit]
        shows_with_setlists = []
        
        for i, show in enumerate(recent_shows):
            try:
                print(f"  Fetching setlist {i+1}/{len(recent_shows)} for {show.get('showdate')}...")
                
                setlist_data = self.make_api_request(f"/setlists/get?showid={show.get('showid')}")
                
                show_with_setlist = {
                    **show,
                    'setlist': setlist_data
                }
                shows_with_setlists.append(show_with_setlist)
                
                # Longer delay for setlist requests
                time.sleep(0.5)
                
            except Exception as error:
                print(f"    ❌ Error fetching setlist for show {show.get('showid')}: {error}")
                shows_with_setlists.append(show)
        
        file_path = DATA_DIR / 'recent-shows-with-setlists.json'
        with open(file_path, 'w') as f:
            json.dump(shows_with_setlists, f, indent=2)
        
        print(f"✅ Saved {len(shows_with_setlists)} shows with setlists to {file_path}")
        return shows_with_setlists

    def create_processed_data(self, songs: List[Dict[str, Any]], shows: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process and aggregate data for the website using ONLY genuine API data"""
        print("🔄 Processing and aggregating data...")
        
        # Filter out shows from the future
        today = datetime.now().strftime('%Y-%m-%d')
        shows = [show for show in shows if show.get('showdate', '') <= today]
        
        # Double-check that we only have Phish shows
        phish_shows = [
            show for show in shows 
            if show.get('artistid') == 1 or show.get('artist_name') == 'Phish'
        ]
        
        print(f"📊 Processing {len(phish_shows)} Phish shows (filtered from {len(shows)} total)")
        
        # Create song statistics using ONLY genuine API data
        song_stats = {}
        
        for song in songs:
            song_name = song.get('song', '')
            times_played = int(song.get('times_played', 0))
            
            # Use only the data provided by the API
            song_stats[song_name] = {
                'name': song_name,
                'slug': song_name.lower().replace(' ', '-').replace('\'', '').replace(',', '').replace('.', '').replace('(', '').replace(')', ''),
                'timesPlayed': times_played,
                'firstPlayed': song.get('debut'),
                'lastPlayed': song.get('last_played'),
                'gap': int(song.get('gap', 0)) if song.get('gap') else 0,
                # Remove synthetic data - these fields will be populated by real setlist analysis or left null
                'averageLength': None,  # Would need setlist analysis to calculate
                'tags': [],  # Would need analysis to determine
                'longestJam': None  # Would need setlist analysis to determine
            }
        
        # Process show data using genuine API data only
        processed_shows = []
        for show in phish_shows:
            processed_shows.append({
                'showid': show.get('showid'),
                'date': show.get('showdate'),
                'venue': show.get('venue', 'Unknown Venue'),
                'city': show.get('city', ''),
                'state': show.get('state', ''),
                'country': show.get('country', 'USA'),
                'setlistnotes': show.get('setlistnotes', ''),
                'tour_name': show.get('tour_name', ''),
                'tourid': show.get('tourid'),
                'songs': []  # Would need setlist data to populate
            })
        
        processed_data = {
            'songs': list(song_stats.values()),
            'shows': processed_shows,
            'metadata': {
                'totalSongs': len(song_stats),
                'totalShows': len(processed_shows),
                'lastUpdated': datetime.now().isoformat(),
                'dataSource': 'phish.net API v5 (genuine data only)',
                'note': 'Song lengths, tags, and longest jams removed - would require setlist analysis'
            }
        }
        
        file_path = DATA_DIR / 'processed-data.json'
        with open(file_path, 'w') as f:
            json.dump(processed_data, f, indent=2)
        
        print(f"✅ Saved processed data to {file_path}")
        return processed_data

def main():
    """Main function to run the data download process"""
    print("🎸 Starting Phish data download (genuine data only)...\n")
    
    downloader = PhishDataDownloader(API_KEY)
    
    try:
        # Fetch core data
        print("Phase 1: Fetching core data...")
        songs = downloader.fetch_all_songs()
        time.sleep(1)
        
        shows = downloader.fetch_all_shows()
        time.sleep(1)
        
        # Fetch recent yearly data
        print("\nPhase 2: Fetching yearly data...")
        downloader.fetch_yearly_shows(2020)  # Focus on recent years, exclude future shows
        time.sleep(1)
        
        # Fetch some setlists for recent shows
        print("\nPhase 3: Fetching recent setlists...")
        if shows:
            downloader.fetch_setlists_for_recent_shows(shows, limit=20)
        
        # Process and create optimized data structure
        print("\nPhase 4: Creating processed data...")
        downloader.create_processed_data(songs, shows)
        
        print(f"\n🎉 Data download complete!")
        print(f"📁 All data saved to: {DATA_DIR}")
        print("\nFiles created:")
        print("  - songs.json (raw song data)")
        print("  - shows.json (raw show data)")
        print("  - shows-by-year.json (organized by year)")
        print("  - recent-shows-with-setlists.json (recent shows with setlist data)")
        print("  - processed-data.json (optimized for website - genuine data only)")
        
        print("\n⚠️  NOTE: Song lengths, tags, and longest jams have been removed.")
        print("   To get this data, you would need to analyze actual setlist data.")
        
    except Exception as error:
        print(f"💥 Fatal error: {error}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
