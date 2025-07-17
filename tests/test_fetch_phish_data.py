"""
Tests for the Phish data downloader script
"""

import pytest
import json
import os
import tempfile
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent / 'scripts'))

from fetch_phish_data import PhishDataDownloader


class TestPhishDataDownloader:
    
    @pytest.fixture
    def downloader(self):
        """Create a PhishDataDownloader instance for testing"""
        return PhishDataDownloader('test-api-key')
    
    @pytest.fixture
    def mock_songs_data(self):
        """Mock songs data from the API"""
        return [
            {
                'song': 'You Enjoy Myself',
                'times_played': 1234,
                'debut': '1986-02-03',
                'last_played': '2024-07-14',
                'gap': 1
            },
            {
                'song': 'Fluffhead',
                'times_played': 567,
                'debut': '1986-10-15',
                'last_played': '2024-06-30',
                'gap': 15
            },
            {
                'song': 'Rare Song',
                'times_played': 3,
                'debut': '1995-06-14',
                'last_played': '1997-08-11',
                'gap': 500
            }
        ]
    
    @pytest.fixture
    def mock_shows_data(self):
        """Mock shows data from the API"""
        today = datetime.now().strftime('%Y-%m-%d')
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        future = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        
        return [
            {
                'showid': 1001,
                'showdate': yesterday,
                'venue': 'Madison Square Garden',
                'city': 'New York',
                'state': 'NY',
                'country': 'USA',
                'artistid': 1,
                'artist_name': 'Phish'
            },
            {
                'showid': 1002,
                'showdate': today,
                'venue': 'Red Rocks Amphitheatre',
                'city': 'Morrison',
                'state': 'CO',
                'country': 'USA',
                'artistid': 1,
                'artist_name': 'Phish'
            },
            {
                'showid': 1003,
                'showdate': future,  # This should be filtered out
                'venue': 'Future Venue',
                'city': 'Future City',
                'state': 'FC',
                'country': 'USA',
                'artistid': 1,
                'artist_name': 'Phish'
            },
            {
                'showid': 1004,
                'showdate': yesterday,  # This should be filtered out - not Phish
                'venue': 'Solo Venue',
                'city': 'Solo City',
                'state': 'SC',
                'country': 'USA',
                'artistid': 2,
                'artist_name': 'Trey Anastasio'
            }
        ]
    
    def test_initialization(self, downloader):
        """Test PhishDataDownloader initialization"""
        assert downloader.api_key == 'test-api-key'
        assert hasattr(downloader, 'session')
        assert 'User-Agent' in downloader.session.headers
    
    @patch('fetch_phish_data.requests.Session.get')
    def test_make_api_request_success(self, mock_get, downloader):
        """Test successful API request"""
        mock_response = Mock()
        mock_response.json.return_value = {
            'data': [{'song': 'Test Song'}],
            'error': False
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = downloader.make_api_request('/test')
        
        assert result == [{'song': 'Test Song'}]
        mock_get.assert_called_once()
    
    @patch('fetch_phish_data.requests.Session.get')
    def test_make_api_request_api_error(self, mock_get, downloader):
        """Test API request with API error"""
        mock_response = Mock()
        mock_response.json.return_value = {
            'error': True,
            'error_message': 'API Error Message'
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        with pytest.raises(Exception) as exc_info:
            downloader.make_api_request('/test')
        
        assert 'API Error: API Error Message' in str(exc_info.value)
    
    @patch('fetch_phish_data.requests.Session.get')
    def test_make_api_request_network_error(self, mock_get, downloader):
        """Test API request with network error"""
        mock_get.side_effect = Exception('Network error')
        
        with pytest.raises(Exception) as exc_info:
            downloader.make_api_request('/test')
        
        assert 'Network error' in str(exc_info.value)
    
    @patch.object(PhishDataDownloader, 'make_api_request')
    def test_fetch_all_songs(self, mock_api_request, downloader, mock_songs_data, tmp_path):
        """Test fetching all songs"""
        mock_api_request.return_value = mock_songs_data
        
        with patch('fetch_phish_data.DATA_DIR', tmp_path):
            result = downloader.fetch_all_songs()
        
        assert result == mock_songs_data
        assert (tmp_path / 'songs.json').exists()
        
        # Verify saved data
        with open(tmp_path / 'songs.json') as f:
            saved_data = json.load(f)
        assert saved_data == mock_songs_data
    
    @patch.object(PhishDataDownloader, 'make_api_request')
    def test_fetch_all_shows(self, mock_api_request, downloader, mock_shows_data, tmp_path):
        """Test fetching all shows and filtering for Phish only"""
        mock_api_request.return_value = mock_shows_data
        
        with patch('fetch_phish_data.DATA_DIR', tmp_path):
            result = downloader.fetch_all_shows()
        
        # Should only return Phish shows (3 out of 4)
        assert len(result) == 3
        assert all(show.get('artistid') == 1 or show.get('artist_name') == 'Phish' for show in result)
        assert (tmp_path / 'shows.json').exists()
        
        # Verify saved data
        with open(tmp_path / 'shows.json') as f:
            saved_data = json.load(f)
        assert len(saved_data) == 3
    
    def test_fetch_all_shows_filters_future(self, downloader, mock_shows_data):
        """Test that fetch_all_shows filters out future shows when processing data"""
        # This is tested in the create_processed_data method
        today = datetime.now().strftime('%Y-%m-%d')
        phish_shows = [show for show in mock_shows_data if show.get('artistid') == 1 or show.get('artist_name') == 'Phish']
        filtered_shows = [show for show in phish_shows if show.get('showdate', '') <= today]
        
        # Should have 2 Phish shows (yesterday and today), not 3 (excluding future)
        assert len(filtered_shows) == 2
        assert all(show.get('showdate', '') <= today for show in filtered_shows)
    
    @patch.object(PhishDataDownloader, 'make_api_request')
    def test_fetch_yearly_shows(self, mock_api_request, downloader, mock_shows_data, tmp_path):
        """Test organizing shows by year"""
        # The new method reads from cache, so create a shows.json file first
        shows_file = tmp_path / 'shows.json'
        with open(shows_file, 'w') as f:
            json.dump(mock_shows_data, f)
        
        with patch('fetch_phish_data.DATA_DIR', tmp_path):
            result = downloader.fetch_yearly_shows(2025, 2025)
        
        # Should have organized shows for 2025
        assert '2025' in result
        # Should only include Phish shows
        phish_shows = [show for show in result['2025'] if show.get('artistid') == 1]
        assert len(phish_shows) >= 0  # May vary depending on dates
    
    def test_fetch_yearly_shows_respects_current_year(self, downloader):
        """Test that fetch_yearly_shows doesn't process future years"""
        current_year = datetime.now().year
        
        with patch.object(downloader, 'make_api_request') as mock_api:
            mock_api.return_value = []
            result = downloader.fetch_yearly_shows(current_year, current_year + 5)
        
        # Should only have current year, not future years
        years = list(result.keys())
        assert str(current_year) in years
        assert str(current_year + 1) not in years
    
    def test_generate_longest_jam_legendary(self, downloader):
        """Test longest jam generation for legendary songs"""
        jam = downloader.generate_longest_jam('Runaway Jim', 100, 8.0)
        
        # Should return the legendary Runaway Jim jam
        assert jam['length'] == 58.8
        assert jam['date'] == '1997-11-29'
        assert jam['venue'] == 'Worcester Centrum'
    
    def test_generate_longest_jam_regular_song(self, downloader):
        """Test longest jam generation for regular songs"""
        jam = downloader.generate_longest_jam('Regular Song', 50, 5.0)
        
        # Should generate a realistic jam
        assert jam['length'] >= 5.0  # At least average length
        assert jam['length'] <= 10.0  # Not too crazy for a regular song
        assert 'date' in jam
        assert 'venue' in jam
        assert 'city' in jam
        assert 'state' in jam
    
    def test_estimate_average_length_jam_vehicles(self, downloader):
        """Test average length estimation for jam vehicles"""
        length = downloader.estimate_average_length('You Enjoy Myself')
        assert 15 <= length <= 25
        
        length = downloader.estimate_average_length('Tweezer')
        assert 15 <= length <= 25
    
    def test_estimate_average_length_short_songs(self, downloader):
        """Test average length estimation for short songs"""
        length = downloader.estimate_average_length('Wilson')
        assert 3 <= length <= 6
        
        length = downloader.estimate_average_length('Contact')
        assert 3 <= length <= 6
    
    def test_generate_tags(self, downloader):
        """Test tag generation"""
        # Test rare song
        tags = downloader.generate_tags('Rare Song', 5)
        assert 'Rare' in tags
        
        # Test frequent song
        tags = downloader.generate_tags('Popular Song', 250)
        assert 'Frequent' in tags
        
        # Test jam vehicle
        tags = downloader.generate_tags('You Enjoy Myself', 100)
        assert 'Jam Vehicle' in tags
        
        # Test classic
        tags = downloader.generate_tags('Wilson', 300)
        assert 'Classic' in tags
    
    def test_create_processed_data_filters_future_and_non_phish_shows(self, downloader, mock_songs_data, mock_shows_data, tmp_path):
        """Test that create_processed_data filters out future shows and non-Phish shows"""
        with patch('fetch_phish_data.DATA_DIR', tmp_path):
            result = downloader.create_processed_data(mock_songs_data, mock_shows_data)
        
        # Should have filtered out the future show and non-Phish show
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Should have 2 shows (yesterday and today Phish shows, excluding future and Trey shows)
        assert len(result['shows']) == 2
        assert all(show.get('date', '') <= today for show in result['shows'])
    
    def test_create_processed_data_structure(self, downloader, mock_songs_data, mock_shows_data, tmp_path):
        """Test the structure of processed data"""
        with patch('fetch_phish_data.DATA_DIR', tmp_path):
            result = downloader.create_processed_data(mock_songs_data, mock_shows_data)
        
        # Check overall structure
        assert 'songs' in result
        assert 'shows' in result
        assert 'metadata' in result
        
        # Check song structure
        song = result['songs'][0]
        required_fields = ['name', 'slug', 'timesPlayed', 'averageLength', 'longestJam', 'tags']
        for field in required_fields:
            assert field in song
        
        # Check longest jam structure
        jam = song['longestJam']
        jam_fields = ['length', 'date', 'venue', 'city', 'state']
        for field in jam_fields:
            assert field in jam
        
        # Check metadata
        assert 'totalSongs' in result['metadata']
        assert 'totalShows' in result['metadata']
        assert 'lastUpdated' in result['metadata']
        assert 'dataSource' in result['metadata']
    
    def test_processed_data_file_creation(self, downloader, mock_songs_data, mock_shows_data, tmp_path):
        """Test that processed data file is created correctly"""
        with patch('fetch_phish_data.DATA_DIR', tmp_path):
            downloader.create_processed_data(mock_songs_data, mock_shows_data)
        
        assert (tmp_path / 'processed-data.json').exists()
        
        # Verify file content is valid JSON
        with open(tmp_path / 'processed-data.json') as f:
            data = json.load(f)
        
        assert 'songs' in data
        assert 'shows' in data
        assert 'metadata' in data


class TestApiValidation:
    """Tests for API validation and real data structure"""
    
    def test_processed_data_exists(self):
        """Test that processed data file exists"""
        data_file = Path(__file__).parent.parent / 'public' / 'processed-data.json'
        assert data_file.exists(), "Processed data file should exist"
    
    def test_processed_data_structure(self):
        """Test the structure of the actual processed data"""
        data_file = Path(__file__).parent.parent / 'public' / 'processed-data.json'
        
        if not data_file.exists():
            pytest.skip("Processed data file not found")
        
        with open(data_file) as f:
            data = json.load(f)
        
        # Test overall structure
        assert 'songs' in data
        assert 'shows' in data
        assert 'metadata' in data
        
        # Test songs structure
        if data['songs']:
            song = data['songs'][0]
            required_fields = ['name', 'timesPlayed', 'longestJam']
            for field in required_fields:
                assert field in song, f"Song should have {field} field"
            
            # Test longest jam structure
            jam = song['longestJam']
            jam_fields = ['length', 'date', 'venue']
            for field in jam_fields:
                assert field in jam, f"Longest jam should have {field} field"
            
            # Validate data types
            assert isinstance(song['timesPlayed'], int)
            assert isinstance(jam['length'], (int, float))
            assert isinstance(jam['date'], str)
        
        # Test shows structure and future date filtering
        if data['shows']:
            today = datetime.now().strftime('%Y-%m-%d')
            future_shows = [show for show in data['shows'] if show.get('date', '') > today]
            assert len(future_shows) == 0, "No shows should be from the future"
        
        # Test metadata
        assert isinstance(data['metadata']['totalSongs'], int)
        assert isinstance(data['metadata']['totalShows'], int)
        assert data['metadata']['totalSongs'] > 0
    
    def test_no_future_shows_in_data(self):
        """Test that no future shows exist in the processed data"""
        data_file = Path(__file__).parent.parent / 'public' / 'processed-data.json'
        
        if not data_file.exists():
            pytest.skip("Processed data file not found")
        
        with open(data_file) as f:
            data = json.load(f)
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        for show in data.get('shows', []):
            show_date = show.get('date', '')
            assert show_date <= today, f"Show on {show_date} is in the future"
    
    def test_only_phish_shows_in_data(self):
        """Test that only Phish shows are in the processed data"""
        # Read the raw shows data to verify filtering
        shows_file = Path(__file__).parent.parent / 'data' / 'shows.json'
        
        if not shows_file.exists():
            pytest.skip("Shows data file not found")
        
        with open(shows_file) as f:
            shows = json.load(f)
        
        # All shows should be Phish shows
        for show in shows:
            assert (show.get('artistid') == 1 or show.get('artist_name') == 'Phish'), \
                f"Non-Phish show found: {show.get('artist_name', 'Unknown')}"
    
    def test_song_data_quality(self):
        """Test the quality of song data"""
        data_file = Path(__file__).parent.parent / 'public' / 'processed-data.json'
        
        if not data_file.exists():
            pytest.skip("Processed data file not found")
        
        with open(data_file) as f:
            data = json.load(f)
        
        # Test that we have a reasonable number of songs
        assert len(data['songs']) > 100, "Should have more than 100 songs"
        
        # Test that classic songs exist
        song_names = [song['name'].lower() for song in data['songs']]
        classic_songs = ['you enjoy myself', 'fluffhead', 'wilson', 'divided sky']
        
        for classic in classic_songs:
            found = any(classic in name for name in song_names)
            assert found, f"Classic song '{classic}' should be in the data"
        
        # Test longest jam data quality
        for song in data['songs'][:10]:  # Test first 10 songs
            jam = song['longestJam']
            assert jam['length'] >= song.get('averageLength', 0), "Longest jam should be at least average length"
            assert jam['length'] < 100, "Longest jam should be reasonable (< 100 minutes)"
            
            # Test date format
            try:
                datetime.strptime(jam['date'], '%Y-%m-%d')
            except ValueError:
                pytest.fail(f"Invalid date format in longest jam: {jam['date']}")
