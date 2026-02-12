import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { PokemonListResponseDto } from './dto/pokemon-list.dto';
import { PokemonDetailDto } from './dto/pokemon-detail.dto';

describe('PokemonController', () => {
  let controller: PokemonController;
  let mockPokemonService: jest.Mocked<PokemonService>;

  beforeEach(async () => {
    mockPokemonService = {
      getPokemonList: jest.fn(),
      getPokemonByName: jest.fn(),
      searchPokemon: jest.fn(),
      getPaginated: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /pokemon', () => {
    it('should return pokemon list with default limit and offset', async () => {
      const mockResponse: PokemonListResponseDto = {
        pokemon: [
          { id: 1, name: 'bulbasaur', image: 'https://...' },
          { id: 2, name: 'ivysaur', image: 'https://...' },
        ],
        total: 1025,
        hasMore: true,
      };

      mockPokemonService.getPokemonList.mockResolvedValue(mockResponse);

      const result = await controller.getPokemonList(20, 0);

      expect(result).toEqual(mockResponse);
      expect(mockPokemonService.getPokemonList).toHaveBeenCalledWith(20, 0);
    });

    it('should return pokemon list with custom limit and offset', async () => {
      const mockResponse: PokemonListResponseDto = {
        pokemon: [
          { id: 21, name: 'spearow', image: 'https://...' },
          { id: 22, name: 'fearow', image: 'https://...' },
        ],
        total: 1025,
        hasMore: true,
      };

      mockPokemonService.getPokemonList.mockResolvedValue(mockResponse);

      const result = await controller.getPokemonList(10, 20);

      expect(result).toEqual(mockResponse);
      expect(mockPokemonService.getPokemonList).toHaveBeenCalledWith(10, 20);
    });

    it('should convert query parameters to numbers', async () => {
      const mockResponse: PokemonListResponseDto = {
        pokemon: [],
        total: 1025,
        hasMore: false,
      };

      mockPokemonService.getPokemonList.mockResolvedValue(mockResponse);

      await controller.getPokemonList('50' as any, '100' as any);

      expect(mockPokemonService.getPokemonList).toHaveBeenCalledWith(50, 100);
    });
  });

  describe('GET /pokemon/:name', () => {
    it('should return pokemon detail by name', async () => {
      const mockPokemon: PokemonDetailDto = {
        id: 25,
        name: 'pikachu',
        image: 'https://...',
        height: 4,
        weight: 60,
        abilities: [
          {
            name: 'static',
            hidden: false,
          },
        ],
        stats: [
          {
            name: 'hp',
            baseStat: 35,
          },
          {
            name: 'attack',
            baseStat: 55,
          },
        ],
        evolutionChain: {
          previous: null,
          current: { id: 25, name: 'pikachu', image: 'https://...' },
          next: { id: 26, name: 'raichu', image: 'https://...' },
        },
      };

      mockPokemonService.getPokemonByName.mockResolvedValue(mockPokemon);

      const result = await controller.getPokemonByName('pikachu');

      expect(result).toEqual(mockPokemon);
      expect(mockPokemonService.getPokemonByName).toHaveBeenCalledWith(
        'pikachu',
      );
    });

    it('should be case insensitive', async () => {
      const mockPokemon: PokemonDetailDto = {
        id: 1,
        name: 'bulbasaur',
        image: 'https://...',
        height: 7,
        weight: 69,
        abilities: [],
        stats: [],
        evolutionChain: {
          previous: null,
          current: { id: 1, name: 'bulbasaur', image: 'https://...' },
          next: { id: 2, name: 'ivysaur', image: 'https://...' },
        },
      };

      mockPokemonService.getPokemonByName.mockResolvedValue(mockPokemon);

      await controller.getPokemonByName('BULBASAUR');

      expect(mockPokemonService.getPokemonByName).toHaveBeenCalledWith(
        'BULBASAUR',
      );
    });
  });

  describe('GET /pokemon/search', () => {
    it('should search pokemon by query', async () => {
      const mockResponse: PokemonListResponseDto = {
        pokemon: [
          { id: 25, name: 'pikachu', image: 'https://...' },
        ],
        total: 1,
        hasMore: false,
      };

      mockPokemonService.searchPokemon.mockResolvedValue(mockResponse);

      const result = await controller.searchPokemon('pikachu');

      expect(result).toEqual(mockResponse);
      expect(mockPokemonService.searchPokemon).toHaveBeenCalledWith('pikachu');
    });

    it('should return empty result for not found pokemon', async () => {
      const mockResponse: PokemonListResponseDto = {
        pokemon: [],
        total: 0,
        hasMore: false,
      };

      mockPokemonService.searchPokemon.mockResolvedValue(mockResponse);

      const result = await controller.searchPokemon('nonexistent');

      expect(result.pokemon.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('GET /pokemon/paginated', () => {
    it('should return paginated data with pagination info', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'bulbasaur', image: 'https://...' },
          { id: 2, name: 'ivysaur', image: 'https://...' },
        ],
        pagination: {
          offset: 0,
          limit: 20,
          total: 1025,
          hasMore: true,
          nextOffset: 20,
        },
      };

      mockPokemonService.getPaginated.mockResolvedValue(mockResponse);

      const result = await controller.getPaginated(20, 0);

      expect(result.data).toBeDefined();
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.nextOffset).toBe(20);
      expect(mockPokemonService.getPaginated).toHaveBeenCalledWith(20, 0);
    });

    it('should handle different pagination offsets', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          offset: 100,
          limit: 20,
          total: 1025,
          hasMore: true,
          nextOffset: 120,
        },
      };

      mockPokemonService.getPaginated.mockResolvedValue(mockResponse);

      await controller.getPaginated(20, 100);

      expect(mockPokemonService.getPaginated).toHaveBeenCalledWith(20, 100);
    });
  });
});
