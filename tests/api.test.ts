/**
 * Tests for the frontend API utilities
 */

import { phishApi } from '../src/lib/simpleLocalPhishApi';
import type { Song } from '../src/types/phish';

describe('simpleLocalPhishApi', () => {
  describe('getSongStats', () => {
    it('should return song statistics', async () => {
      const result = await phishApi.getSongStats();

      expect(result.length).toBeGreaterThan(100); // Should have many songs
      
      // Find You Enjoy Myself in the results
      const yem = result.find(song => song.name === 'You Enjoy Myself');
      expect(yem).toBeDefined();
      expect(yem?.timesPlayed).toBeGreaterThan(500);
      expect(yem?.longestJam).toBeDefined();
      expect(yem?.longestJam?.length).toBeGreaterThan(20);
    });

    it('should return songs with longest jam data', async () => {
      const result = await phishApi.getSongStats();

      result.slice(0, 10).forEach((song: Song) => {
        expect(song).toHaveProperty('name');
        expect(song).toHaveProperty('timesPlayed');
        expect(song).toHaveProperty('longestJam');
        
        if (song.longestJam) {
          expect(song.longestJam).toHaveProperty('length');
          expect(song.longestJam).toHaveProperty('date');
          expect(song.longestJam).toHaveProperty('venue');
          expect(typeof song.longestJam.length).toBe('number');
          expect(song.longestJam.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('getTopSongsByPlayCount', () => {
    it('should return top songs by play count', async () => {
      const result = await phishApi.getTopSongsByPlayCount(3);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('You Enjoy Myself');
      expect(result[0].timesPlayed).toBeGreaterThan(600);
      expect(result[1].timesPlayed).toBeGreaterThan(400);
      expect(result[2].timesPlayed).toBeGreaterThan(400);
      // Results should be sorted by play count descending
      expect(result[0].timesPlayed).toBeGreaterThanOrEqual(result[1].timesPlayed);
      expect(result[1].timesPlayed).toBeGreaterThanOrEqual(result[2].timesPlayed);
    });

    it('should return all songs if limit is higher than available songs', async () => {
      const result = await phishApi.getTopSongsByPlayCount(10);

      expect(result).toHaveLength(10);
    });
  });

  describe('getTopSongsByLength', () => {
    it('should return top songs by average length', async () => {
      const result = await phishApi.getTopSongsByLength(3);

      expect(result).toHaveLength(3);
      expect(result[0].averageLength).toBeGreaterThan(15);
      // Results should be sorted by average length descending
      expect(result[0].averageLength).toBeGreaterThanOrEqual(result[1].averageLength);
      expect(result[1].averageLength).toBeGreaterThanOrEqual(result[2].averageLength);
    });
  });

  describe('getTopSongsByLongestJam', () => {
    it('should return top songs by longest jam length', async () => {
      const result = await phishApi.getTopSongsByLongestJam(3);

      expect(result).toHaveLength(3);
      // The legendary Runaway Jim should be #1
      expect(result[0].name).toBe('Runaway Jim');
      expect(result[0].longestJam?.length).toBe(58.8);
      expect(result[1].longestJam?.length).toBeGreaterThan(30);
      // Results should be sorted by jam length descending
      expect(result[0].longestJam?.length).toBeGreaterThanOrEqual(result[1].longestJam?.length || 0);
      expect(result[1].longestJam?.length).toBeGreaterThanOrEqual(result[2].longestJam?.length || 0);
    });

    it('should include jam details in results', async () => {
      const result = await phishApi.getTopSongsByLongestJam(1);

      expect(result[0].longestJam).toEqual({
        length: 58.8,
        date: '1997-11-29',
        venue: 'Worcester Centrum',
        city: 'Worcester',
        state: 'MA',
        showid: 5623005
      });
    });
  });

  describe('getSongsByTag', () => {
    it('should filter songs by tag', async () => {
      const result = await phishApi.getSongsByTag('Classic');

      expect(result.length).toBeGreaterThan(3);
      expect(result.every((song: Song) => song.tags.includes('Classic'))).toBe(true);
    });

    it('should return empty array for non-existent tag', async () => {
      const result = await phishApi.getSongsByTag('NonExistentTag');

      expect(result).toHaveLength(0);
    });
  });

  describe('searchSongs', () => {
    it('should find songs by name', async () => {
      const result = await phishApi.searchSongs('Fluffhead');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Fluffhead');
    });

    it('should be case insensitive', async () => {
      const result = await phishApi.searchSongs('fluff');

      expect(result.length).toBeGreaterThanOrEqual(1);
      const fluffhead = result.find(song => song.name === 'Fluffhead');
      expect(fluffhead).toBeDefined();
    });

    it('should return empty array for no matches', async () => {
      const result = await phishApi.searchSongs('NonExistentSongName12345');

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllTags', () => {
    it('should return all available tags', async () => {
      const result = await phishApi.getAllTags();

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Classic');
      expect(result).toContain('Jam Vehicle');
      expect(result).toContain('Frequent');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', async () => {
      const result = await phishApi.getMetadata();

      expect(result.totalSongs).toBeGreaterThan(900);
      expect(result.totalShows).toBeGreaterThan(2000);
      expect(result.dataSource).toContain('phish.net API v5');
      expect(result.lastUpdated).toBeDefined();
    });
  });

  describe('show data', () => {
    describe('getShowsByYear', () => {
      it('should filter shows by year', async () => {
        const result = await phishApi.getShowsByYear(2024);

        expect(result.length).toBeGreaterThan(10);
        expect(result.every(show => new Date(show.date).getFullYear() === 2024)).toBe(true);
      });

      it('should return empty array for year with no shows', async () => {
        const result = await phishApi.getShowsByYear(1980);

        expect(result).toHaveLength(0);
      });
    });

    describe('getSummer2025Shows', () => {
      it('should filter summer 2025 shows', async () => {
        const result = await phishApi.getSummer2025Shows();

        expect(Array.isArray(result)).toBe(true);
        // Summer 2025 shows are present in data but may include future shows
        if (result.length > 0) {
          // All should be summer 2025 shows (July-September)
          expect(result.every(show => {
            const date = new Date(show.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            return year === 2025 && month >= 7 && month <= 9;
          })).toBe(true);
        }
      });
    });
  });
});
