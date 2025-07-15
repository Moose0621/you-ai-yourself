"""
Test configuration and fixtures for Phish data application
"""
import pytest
import json
import os
from pathlib import Path
from unittest.mock import Mock, patch
from datetime import datetime, date

# Test data directory
TEST_DATA_DIR = Path(__file__).parent / "data"
TEST_DATA_DIR.mkdir(exist_ok=True)

@pytest.fixture
def mock_phish_api_response():
    """Mock API response data for testing"""
    return {
        "success": True,
        "data": [
            {
                "song": "You Enjoy Myself",
                "times_played": 532,
                "debut": "1985-05-03",
                "last_played": "2024-12-31",
                "gap": 0,
                "slug": "you-enjoy-myself"
            },
            {
                "song": "Tweezer",
                "times_played": 398,
                "debut": "1990-02-03",
                "last_played": "2024-12-30",
                "gap": 1,
                "slug": "tweezer"
            }
        ]
    }

@pytest.fixture
def mock_shows_response():
    """Mock shows API response"""
    return {
        "success": True,
        "data": [
            {
                "showid": "1234567",
                "showdate": "2024-07-15",
                "venue": "Madison Square Garden",
                "city": "New York",
                "state": "NY",
                "country": "USA"
            },
            {
                "showid": "7654321", 
                "showdate": "2024-07-14",
                "venue": "Hampton Coliseum",
                "city": "Hampton",
                "state": "VA",
                "country": "USA"
            }
        ]
    }

@pytest.fixture
def mock_setlist_response():
    """Mock setlist API response"""
    return {
        "success": True,
        "data": {
            "set1": [
                {"song": "You Enjoy Myself", "length": "23:45"},
                {"song": "Tweezer", "length": "18:30"}
            ],
            "set2": [
                {"song": "Ghost", "length": "15:20"},
                {"song": "Harry Hood", "length": "12:45"}
            ]
        }
    }

@pytest.fixture
def current_date():
    """Current date for testing date validations"""
    return datetime(2025, 7, 15)

@pytest.fixture
def sample_processed_data():
    """Sample processed data for frontend testing"""
    return {
        "songs": [
            {
                "name": "You Enjoy Myself",
                "slug": "you-enjoy-myself",
                "timesPlayed": 532,
                "averageLength": 18.5,
                "longestJam": {
                    "length": 45.2,
                    "date": "1995-12-09",
                    "venue": "Hersheypark Arena",
                    "city": "Hershey",
                    "state": "PA",
                    "showid": 1234567
                },
                "tags": ["Jam Vehicle", "Popular"],
                "firstPlayed": "1985-05-03",
                "lastPlayed": "2024-12-31",
                "gap": 0
            }
        ],
        "shows": [
            {
                "showid": "1234567",
                "date": "2024-07-15", 
                "venue": "Madison Square Garden",
                "city": "New York",
                "state": "NY",
                "country": "USA"
            }
        ]
    }
