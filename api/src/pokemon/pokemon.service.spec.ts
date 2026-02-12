import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

describe('PokemonService', () => {
  let service: PokemonService;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'POKEAPI_URL') {
          return 'https://pokeapi.co/api/v2';
        }
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRawPokemonByName', () => {
    it('should fetch pokemon data from PokeAPI', async () => {
      const mockPokemonData = {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPokemonData),
      });

      const result = await service.getRawPokemonByName('bulbasaur');

      expect(result).toEqual(mockPokemonData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/bulbasaur',
      );
    });

    it('should throw NOT_FOUND error when pokemon does not exist', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(service.getRawPokemonByName('nonexistent')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw INTERNAL_SERVER_ERROR on fetch error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(service.getRawPokemonByName('bulbasaur')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getPokemonByName', () => {
    it('should return cached pokemon data if available', async () => {
      const mockCachedData = {
        id: 1,
        name: 'bulbasaur',
        image: 'https://...',
        height: 7,
        weight: 69,
        abilities: [],
        stats: [],
        evolutionChain: {},
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(mockCachedData));

      const result = await service.getPokemonByName('bulbasaur');

      expect(result).toEqual(mockCachedData);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        'pokemon:detail:bulbasaur',
      );
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it('should fetch and cache pokemon data when not in cache', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockRawData = {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
        abilities: [
          {
            ability: { name: 'overgrow' },
            is_hidden: false,
          },
        ],
        stats: [
          {
            stat: { name: 'hp' },
            base_stat: 45,
          },
        ],
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://...',
            },
          },
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRawData),
      });

      const result = await service.getPokemonByName('bulbasaur');

      expect(result.id).toBe(1);
      expect(result.name).toBe('bulbasaur');
      expect(mockRedisService.set).toHaveBeenCalled();
    });
  });

  describe('searchPokemon', () => {
    it('should search for pokemon by name and return single result', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockPokemonData = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        abilities: [
          {
            ability: { name: 'static' },
            is_hidden: false,
          },
        ],
        stats: [
          {
            stat: { name: 'hp' },
            base_stat: 35,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPokemonData),
      });

      const result = await service.searchPokemon('pikachu');

      expect(result.total).toBe(1);
      expect(result.pokemon.length).toBe(1);
      expect(result.pokemon[0].name).toBe('pikachu');
      expect(result.hasMore).toBe(false);
    });

    it('should return empty result when pokemon not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.searchPokemon('nonexistent');

      expect(result.total).toBe(0);
      expect(result.pokemon).toEqual([]);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getPokemonList', () => {
    it('should return cached pokemon list if available', async () => {
      const mockCachedList = {
        pokemon: [
          { id: 1, name: 'bulbasaur', image: 'https://...' },
          { id: 2, name: 'ivysaur', image: 'https://...' },
        ],
        total: 1025,
        hasMore: true,
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(mockCachedList));

      const result = await service.getPokemonList(20, 0);

      expect(result).toEqual(mockCachedList);
      expect(mockRedisService.get).toHaveBeenCalledWith('pokemon:list:20:0');
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it('should fetch pokemon list from API and cache it', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockApiResponse = {
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
        count: 1025,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await service.getPokemonList(20, 0);

      expect(result.pokemon.length).toBe(2);
      expect(result.total).toBe(1025);
      expect(result.hasMore).toBe(true);
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw error when API fails', async () => {
      mockRedisService.get.mockResolvedValue(null);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(service.getPokemonList(20, 0)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getPaginated', () => {
    it('should return paginated pokemon data with pagination info', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockApiResponse = {
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        ],
        count: 1025,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await service.getPaginated(20, 0);

      expect(result.data).toBeDefined();
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1025);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.nextOffset).toBe(20);
    });
  });

  describe('Helper Methods', () => {
    it('should extract ID from URL correctly', () => {
      const url = 'https://pokeapi.co/api/v2/pokemon/25/';
      const id = (service as any).extractIdFromUrl(url);
      expect(id).toBe(25);
    });

    it('should generate correct image URL', () => {
      const imageUrl = (service as any).getImageUrl(25);
      expect(imageUrl).toContain('pokemon/other/official-artwork/25.png');
    });

    it('should handle invalid URL for ID extraction', () => {
      const url = 'invalid-url';
      const id = (service as any).extractIdFromUrl(url);
      expect(id).toBe(0);
    });
  });
});
