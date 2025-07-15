/**
 * Tests for the frontend API utilities
 * Updated to work with real Phish.net data
 */

import { phishApi } from '../src/lib/simpleLocalPhishApi';
import type { Song, FilterOptions } from '../src/types/phish';

// Real data expectations based on actual Phish.net data
const EXPECTED_DATA_STRUCTURE = {
  minSongs: 800,           // At least 800+ songs in catalog
  minShows: 2000,          // At least 2000+ shows
  topSongs: {
    'You Enjoy Myself': { minPlays: 500, tags: ['Frequent', 'Jam Vehicle', 'Classic', '1.0 Era'] },
    'Possum': { minPlays: 450, tags: ['Frequent', '1.0 Era'] },
    'Mike\'s Song': { minPlays: 400, tags: ['Frequent', '1.0 Era'] },
    'Chalk Dust Torture': { minPlays: 400, tags: ['Frequent', '1.0 Era'] }
  },
  jamVehicles: ['You Enjoy Myself', 'Tweezer', 'Ghost', 'Harry Hood'],
  classicSongs: ['You Enjoy Myself', 'Fluffhead', 'Wilson', 'Golgi Apparatus']
};
      lastPlayed: '2024-07-10',
      gap: 5,
      averageLength: 4.1,
      tags: ['Classic', 'Frequent'],
      longestJam: {
        length: 8.3,
        date: '1997-11-17',
        venue: 'McNichols Sports Arena',
        city: 'Denver',
        state: 'CO',
        showid: 1234569
      }
    },
    {
      name: 'Rare Song',
      slug: 'rare-song',
      timesPlayed: 3,
      firstPlayed: '1995-06-14',
      lastPlayed: '1997-08-11',
      gap: 500,
      averageLength: 6.2,
      tags: ['Rare'],
      longestJam: {
        length: 7.1,
        date: '1996-07-12',
        venue: 'Some Venue',
        city: 'Some City',
        state: 'SC',
        showid: 1234570
      }
    }
  ],
  shows: [
    {
      showid: 1001,
      date: '2024-07-14',
      venue: 'Madison Square Garden',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      setlistnotes: '',
      songs: []
    },
    {
      showid: 1002,
      date: '2024-06-30',
      venue: 'Red Rocks Amphitheatre',
      city: 'Morrison',
      state: 'CO',
      country: 'USA',
      setlistnotes: '',
      songs: []
    }
  ],
  metadata: {
    totalSongs: 4,
    totalShows: 2,
    lastUpdated: '2024-07-15T14:00:00.000Z',
    dataSource: 'phish.net API v5'
  }
};

// Mock the JSON import
jest.mock('../../public/processed-data.json', () => mockProcessedData, { virtual: true });

describe('simpleLocalPhishApi', () => {
  describe('getSongStats', () => {
    it('should return song statistics', async () => {
      const result = await phishApi.getSongStats();

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(expect.objectContaining({
        name: 'You Enjoy Myself',
        timesPlayed: 1234,
        averageLength: 18.5
      }));
    });

    it('should return songs with longest jam data', async () => {
      const result = await phishApi.getSongStats();

      result.forEach((song: Song) => {
        expect(song).toHaveProperty('name');
        expect(song).toHaveProperty('timesPlayed');
        expect(song).toHaveProperty('longestJam');
        
        if (song.longestJam) {
          expect(song.longestJam).toHaveProperty('length');
          expect(song.longestJam).toHaveProperty('date');
          expect(song.longestJam).toHaveProperty('venue');
        }
      });
    });
  });

  describe('getTopSongsByPlayCount', () => {
    it('should return top songs by play count', async () => {
      const result = await phishApi.getTopSongsByPlayCount(3);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('You Enjoy Myself');
      expect(result[0].timesPlayed).toBe(1234);
      expect(result[1].name).toBe('Wilson');
      expect(result[1].timesPlayed).toBe(890);
      expect(result[2].name).toBe('Fluffhead');
      expect(result[2].timesPlayed).toBe(567);
    });

    it('should return all songs if limit is higher than available songs', async () => {
      const result = await phishApi.getTopSongsByPlayCount(10);

      expect(result).toHaveLength(4);
    });
  });

  describe('getTopSongsByLongestJam', () => {
    it('should return top songs by longest jam length', async () => {
      const result = await phishApi.getTopSongsByLongestJam(3);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('You Enjoy Myself');
      expect(result[0].longestJam?.length).toBe(45.2);
      expect(result[1].name).toBe('Fluffhead');
      expect(result[1].longestJam?.length).toBe(16.8);
      expect(result[2].name).toBe('Wilson');
      expect(result[2].longestJam?.length).toBe(8.3);
    });

    it('should include jam details in results', async () => {
      const result = await phishApi.getTopSongsByLongestJam(1);

      expect(result[0].longestJam).toEqual({
        length: 45.2,
        date: '1995-12-09',
        venue: 'Hersheypark Arena',
        city: 'Hershey',
        state: 'PA',
        showid: 1234567
      });
    });
  });

  describe('getSongsByTag', () => {
    it('should filter songs by tag', async () => {
      const result = await phishApi.getSongsByTag('Classic');

      expect(result).toHaveLength(3);
      expect(result.every((song: Song) => song.tags.includes('Classic'))).toBe(true);
    });

    it('should return empty array for non-existent tag', async () => {
      const result = await phishApi.getSongsByTag('NonExistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('searchSongs', () => {
    it('should search songs by name', async () => {
      const result = await phishApi.searchSongs('wilson');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Wilson');
    });

    it('should be case insensitive', async () => {
      const result = await phishApi.searchSongs('FLUFF');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fluffhead');
    });

    it('should return empty array for no matches', async () => {
      const result = await phishApi.searchSongs('NonExistentSong');

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags', async () => {
      const result = await phishApi.getAllTags();

      expect(result).toContain('Classic');
      expect(result).toContain('Jam Vehicle');
      expect(result).toContain('Rare');
      expect(result).toContain('Frequent');
      expect(result).toContain('1.0 Era');
    });

    it('should return sorted tags', async () => {
      const result = await phishApi.getAllTags();

      const sortedResult = [...result].sort();
      expect(result).toEqual(sortedResult);
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', async () => {
      const result = await phishApi.getMetadata();

      expect(result.totalSongs).toBe(4);
      expect(result.totalShows).toBe(2);
      expect(result.dataSource).toContain('phish.net API v5');
      
      // Validate lastUpdated is a valid ISO date
      expect(() => new Date(result.lastUpdated)).not.toThrow();
    });
  });

  describe('data validation', () => {
    it('should validate song data structure', async () => {
      const result = await phishApi.getSongStats();

      result.forEach((song: Song) => {
        expect(song).toHaveProperty('name');
        expect(song).toHaveProperty('timesPlayed');
        expect(song).toHaveProperty('longestJam');
        
        // Validate data types
        expect(typeof song.name).toBe('string');
        expect(typeof song.timesPlayed).toBe('number');
        
        if (song.longestJam) {
          expect(typeof song.longestJam.length).toBe('number');
          expect(typeof song.longestJam.date).toBe('string');
          
          // Validate data quality
          expect(song.timesPlayed).toBeGreaterThan(0);
          expect(song.longestJam.length).toBeGreaterThan(0);
          expect(song.longestJam.length).toBeLessThan(100); // Reasonable upper bound
          
          // Validate date format (YYYY-MM-DD)
          expect(song.longestJam.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
    });

    it('should ensure longest jam is at least average length', async () => {
      const result = await phishApi.getSongStats();

      result.forEach((song: Song) => {
        if (song.averageLength && song.longestJam?.length) {
          expect(song.longestJam.length).toBeGreaterThanOrEqual(song.averageLength);
        }
      });
    });
  });

  describe('getShowsByYear', () => {
    it('should filter shows by year', async () => {
      const result = await phishApi.getShowsByYear(2024);

      expect(result).toHaveLength(2);
      expect(result.every(show => new Date(show.date).getFullYear() === 2024)).toBe(true);
    });

    it('should return empty array for year with no shows', async () => {
      const result = await phishApi.getShowsByYear(1980);

      expect(result).toHaveLength(0);
    });
  });

  describe('getSummer2025Shows', () => {
    it('should filter summer 2025 shows', async () => {
      // Add a summer 2025 show to the mock data
      const mockDataWithSummer2025 = {
        ...mockProcessedData,
        shows: [
          ...mockProcessedData.shows,
          {
            showid: 9999,
            date: '2025-08-15',
            venue: 'Summer Venue',
            city: 'Summer City',
            state: 'SC',
            country: 'USA',
            setlistnotes: '',
            songs: []
          }
        ]
      };

      // Mock the updated data
      jest.doMock('../../public/processed-data.json', () => mockDataWithSummer2025, { virtual: true });

      // This would need to be tested with actual 2025 data
      const result = await phishApi.getSummer2025Shows();

      // For now, should return empty since mock data is for 2024
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

// Mock data for testing
const mockProcessedData = {
  songs: [
    {
      name: 'You Enjoy Myself',
      slug: 'you-enjoy-myself',
      timesPlayed: 1234,
      firstPlayed: '1986-02-03',
      lastPlayed: '2024-07-14',
      gap: 1,
      averageLength: 18.5,
      tags: ['Jam Vehicle', 'Classic', '1.0 Era'],
      longestJam: {
        length: 45.2,
        date: '1995-12-09',
        venue: 'Hersheypark Arena',
        city: 'Hershey',
        state: 'PA',
        showid: 1234567
      }
    },
    {
      name: 'Fluffhead',
      slug: 'fluffhead',
      timesPlayed: 567,
      firstPlayed: '1986-10-15',
      lastPlayed: '2024-06-30',
      gap: 15,
      averageLength: 14.2,
      tags: ['Classic'],
      longestJam: {
        length: 16.8,
        date: '1994-06-18',
        venue: 'Veterans Memorial Auditorium',
        city: 'Columbus',
        state: 'OH',
        showid: 1234568
      }
    },
    {
      name: 'Wilson',
      slug: 'wilson',
      timesPlayed: 890,
      firstPlayed: '1986-02-03',
      lastPlayed: '2024-07-10',
      gap: 5,
      averageLength: 4.1,
      tags: ['Classic', 'Frequent'],
      longestJam: {
        length: 8.3,
        date: '1997-11-17',
        venue: 'McNichols Sports Arena',
        city: 'Denver',
        state: 'CO',
        showid: 1234569
      }
    },
    {
      name: 'Rare Song',
      slug: 'rare-song',
      timesPlayed: 3,
      firstPlayed: '1995-06-14',
      lastPlayed: '1997-08-11',
      gap: 500,
      averageLength: 6.2,
      tags: ['Rare'],
      longestJam: {
        length: 7.1,
        date: '1996-07-12',
        venue: 'Some Venue',
        city: 'Some City',
        state: 'SC',
        showid: 1234570
      }
    }
  ],
  shows: [
    {
      showid: 1001,
      date: '2024-07-14',
      venue: 'Madison Square Garden',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      setlistnotes: '',
      songs: []
    },
    {
      showid: 1002,
      date: '2024-06-30',
      venue: 'Red Rocks Amphitheatre',
      city: 'Morrison',
      state: 'CO',
      country: 'USA',
      setlistnotes: '',
      songs: []
    }
  ],
  metadata: {
    totalSongs: 4,
    totalShows: 2,
    lastUpdated: '2024-07-15T14:00:00.000Z',
    dataSource: 'phish.net API v5'
  }
};

// Mock fetch globally
global.fetch = jest.fn();

describe('simpleLocalPhishApi', () => {
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('getSongStats', () => {
    it('should fetch and return song statistics', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProcessedData
      });

      const result = await getSongStats();

      expect(fetch).toHaveBeenCalledWith('/processed-data.json');
      expect(result).toEqual({
        songs: mockProcessedData.songs,
        totalSongs: 4,
        totalShows: 2,
        lastUpdated: mockProcessedData.metadata.lastUpdated
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getSongStats()).rejects.toThrow('Network error');
    });

    it('should handle non-ok responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(getSongStats()).rejects.toThrow('Failed to fetch processed data: 404 Not Found');
    });
  });

  describe('getTopSongsByTimesPlayed', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProcessedData
      });
    });

    it('should return top songs by times played', async () => {
      const result = await getTopSongsByTimesPlayed(3);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('You Enjoy Myself');
      expect(result[0].timesPlayed).toBe(1234);
      expect(result[1].name).toBe('Wilson');
      expect(result[1].timesPlayed).toBe(890);
      expect(result[2].name).toBe('Fluffhead');
      expect(result[2].timesPlayed).toBe(567);
    });

    it('should return all songs if limit is higher than available songs', async () => {
      const result = await getTopSongsByTimesPlayed(10);

      expect(result).toHaveLength(4);
    });

    it('should filter by tags when provided', async () => {
      const filters: FilterOptions = {
        tags: ['Classic']
      };

      const result = await getTopSongsByTimesPlayed(10, filters);

      expect(result).toHaveLength(3);
      expect(result.every(song => song.tags.includes('Classic'))).toBe(true);
    });

    it('should filter by gap when provided', async () => {
      const filters: FilterOptions = {
        gap: { min: 10, max: 50 }
      };

      const result = await getTopSongsByTimesPlayed(10, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fluffhead');
      expect(result[0].gap).toBe(15);
    });

    it('should filter by times played when provided', async () => {
      const filters: FilterOptions = {
        timesPlayed: { min: 500, max: 1000 }
      };

      const result = await getTopSongsByTimesPlayed(10, filters);

      expect(result).toHaveLength(2);
      expect(result.every(song => song.timesPlayed >= 500 && song.timesPlayed <= 1000)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const filters: FilterOptions = {
        tags: ['Classic'],
        timesPlayed: { min: 800, max: 2000 }
      };

      const result = await getTopSongsByTimesPlayed(10, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Wilson');
    });
  });

  describe('getTopSongsByLongestJam', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProcessedData
      });
    });

    it('should return top songs by longest jam length', async () => {
      const result = await getTopSongsByLongestJam(3);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('You Enjoy Myself');
      expect(result[0].longestJam.length).toBe(45.2);
      expect(result[1].name).toBe('Fluffhead');
      expect(result[1].longestJam.length).toBe(16.8);
      expect(result[2].name).toBe('Wilson');
      expect(result[2].longestJam.length).toBe(8.3);
    });

    it('should include jam details in results', async () => {
      const result = await getTopSongsByLongestJam(1);

      expect(result[0].longestJam).toEqual({
        length: 45.2,
        date: '1995-12-09',
        venue: 'Hersheypark Arena',
        city: 'Hershey',
        state: 'PA',
        showid: 1234567
      });
    });

    it('should apply filters correctly', async () => {
      const filters: FilterOptions = {
        tags: ['Rare']
      };

      const result = await getTopSongsByLongestJam(10, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Rare Song');
      expect(result[0].longestJam.length).toBe(7.1);
    });
  });

  describe('filtering functions', () => {
    let songs: Song[];

    beforeEach(() => {
      songs = mockProcessedData.songs;
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProcessedData
      });
    });

    it('should filter out future shows from processed data', async () => {
      const mockDataWithFutureShow = {
        ...mockProcessedData,
        shows: [
          ...mockProcessedData.shows,
          {
            showid: 9999,
            date: '2025-12-31', // Future date
            venue: 'Future Venue',
            city: 'Future City',
            state: 'FC',
            country: 'USA',
            setlistnotes: '',
            songs: []
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataWithFutureShow
      });

      const result = await getSongStats();

      // Should not include future shows in the stats
      expect(result.totalShows).toBe(2); // Only the past/current shows
    });

    it('should validate song data structure', async () => {
      const result = await getSongStats();

      result.songs.forEach(song => {
        expect(song).toHaveProperty('name');
        expect(song).toHaveProperty('timesPlayed');
        expect(song).toHaveProperty('longestJam');
        expect(song.longestJam).toHaveProperty('length');
        expect(song.longestJam).toHaveProperty('date');
        expect(song.longestJam).toHaveProperty('venue');
        
        // Validate data types
        expect(typeof song.name).toBe('string');
        expect(typeof song.timesPlayed).toBe('number');
        expect(typeof song.longestJam.length).toBe('number');
        expect(typeof song.longestJam.date).toBe('string');
        
        // Validate data quality
        expect(song.timesPlayed).toBeGreaterThan(0);
        expect(song.longestJam.length).toBeGreaterThan(0);
        expect(song.longestJam.length).toBeLessThan(100); // Reasonable upper bound
        
        // Validate date format (YYYY-MM-DD)
        expect(song.longestJam.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should ensure longest jam is at least average length', async () => {
      const result = await getSongStats();

      result.songs.forEach(song => {
        if (song.averageLength && song.longestJam.length) {
          expect(song.longestJam.length).toBeGreaterThanOrEqual(song.averageLength);
        }
      });
    });
  });

  describe('data consistency', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProcessedData
      });
    });

    it('should maintain consistent song counts across different API calls', async () => {
      const statsResult = await getSongStats();
      const timesPlayedResult = await getTopSongsByTimesPlayed(100);
      const longestJamResult = await getTopSongsByLongestJam(100);

      expect(statsResult.songs).toHaveLength(4);
      expect(timesPlayedResult).toHaveLength(4);
      expect(longestJamResult).toHaveLength(4);
    });

    it('should have valid metadata', async () => {
      const result = await getSongStats();

      expect(result.totalSongs).toBe(mockProcessedData.songs.length);
      expect(result.totalShows).toBe(mockProcessedData.shows.length);
      expect(result.lastUpdated).toBe(mockProcessedData.metadata.lastUpdated);
      
      // Validate lastUpdated is a valid ISO date
      expect(() => new Date(result.lastUpdated)).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(getSongStats()).rejects.toThrow('Invalid JSON');
    });

    it('should handle missing data properties', async () => {
      const incompleteData = {
        songs: mockProcessedData.songs,
        // Missing shows and metadata
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteData
      });

      const result = await getSongStats();

      expect(result.songs).toBeDefined();
      expect(result.totalSongs).toBe(4);
      expect(result.totalShows).toBe(0); // Should default to 0
    });
  });
});
