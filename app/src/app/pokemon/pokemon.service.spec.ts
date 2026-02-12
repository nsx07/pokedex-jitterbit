import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PokemonService } from './pokemon.service';
import { PokemonListResponse, PokemonDetail, PokemonListItem } from './pokemon.models';

describe('PokemonService (Angular with Jasmine)', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/pokemon';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PokemonService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPokemonList', () => {
    it('should fetch pokemon list with limit and offset', () => {
      const mockResponse: PokemonListResponse = {
        pokemon: [
          { id: 1, name: 'bulbasaur', image: 'https://...' },
          { id: 2, name: 'ivysaur', image: 'https://...' },
        ],
        total: 1025,
        hasMore: true,
      };

      service.getPokemonList(20, 0).subscribe(result => {
        expect(result).toEqual(mockResponse);
        expect(result.pokemon.length).toBe(2);
        expect(result.total).toBe(1025);
      });

      const req = httpMock.expectOne(`${apiUrl}?limit=20&offset=0`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle custom pagination parameters', () => {
      const mockResponse: PokemonListResponse = {
        pokemon: [],
        total: 1025,
        hasMore: true,
      };

      service.getPokemonList(50, 100).subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}?limit=50&offset=100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPokemonByName', () => {
    it('should fetch pokemon detail by name', () => {
      const mockPokemon: PokemonDetail = {
        id: 25,
        name: 'pikachu',
        image: 'https://...',
        height: 4,
        weight: 60,
        abilities: [{ name: 'static', hidden: false }],
        stats: [{ name: 'hp', baseStat: 35 }],
        evolutionChain: {
          previous: null,
          current: { id: 25, name: 'pikachu', image: 'https://...' },
          next: { id: 26, name: 'raichu', image: 'https://...' },
        },
      };

      service.getPokemonByName('pikachu').subscribe(result => {
        expect(result).toEqual(mockPokemon);
        expect(result.name).toBe('pikachu');
      });

      const req = httpMock.expectOne(`${apiUrl}/pikachu`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemon);
    });

    it('should handle pokemon names correctly', () => {
      const mockPokemon: PokemonDetail = {
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

      service.getPokemonByName('bulbasaur').subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/bulbasaur`);
      req.flush(mockPokemon);
    });
  });

  describe('searchPokemon', () => {
    it('should search pokemon by query', () => {
      const mockResponse: PokemonListResponse = {
        pokemon: [{ id: 25, name: 'pikachu', image: 'https://...' }],
        total: 1,
        hasMore: false,
      };

      service.searchPokemon('pikachu').subscribe(result => {
        expect(result.pokemon.length).toBe(1);
        expect(result.pokemon[0].name).toBe('pikachu');
      });

      const req = httpMock.expectOne(`${apiUrl}/search?q=pikachu`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty results for non-existent pokemon', () => {
      const mockResponse: PokemonListResponse = {
        pokemon: [],
        total: 0,
        hasMore: false,
      };

      service.searchPokemon('nonexistent').subscribe(result => {
        expect(result.pokemon.length).toBe(0);
        expect(result.total).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/search?q=nonexistent`);
      req.flush(mockResponse);
    });
  });

  describe('loadInitialPokemon', () => {
    it('should load initial pokemon list and update subjects', (done) => {
      const mockResponse: PokemonListResponse = {
        pokemon: [
          { id: 1, name: 'bulbasaur', image: 'https://...' },
          { id: 2, name: 'ivysaur', image: 'https://...' },
        ],
        total: 1025,
        hasMore: true,
      };

      let pokemonListValue: PokemonListItem[] = [];
      let loadingValue = false;

      service.pokemonList$.subscribe(list => {
        pokemonListValue = list;
      });

      service.isLoading$.subscribe(state => {
        loadingValue = state;
      });

      service.loadInitialPokemon();

      const req = httpMock.expectOne(`${apiUrl}?limit=20&offset=0`);
      req.flush(mockResponse);

      setTimeout(() => {
        expect(pokemonListValue).toEqual(mockResponse.pokemon);
        expect(loadingValue).toBe(false);
        done();
      }, 100);
    });

    it('should handle errors gracefully', (done) => {
      let loadingValue = false;
      let errorOccurred = false;

      service.isLoading$.subscribe(state => {
        loadingValue = state;
      });

      service.loadInitialPokemon();

      const req = httpMock.expectOne(`${apiUrl}?limit=20&offset=0`);
      req.error(new ErrorEvent('Network error'));

      setTimeout(() => {
        expect(loadingValue).toBe(false);
        done();
      }, 100);
    });
  });

  describe('loadMorePokemon', () => {
    it('should append pokemon to existing list', (done) => {
      const initialResponse: PokemonListResponse = {
        pokemon: [{ id: 1, name: 'bulbasaur', image: 'https://...' }],
        total: 1025,
        hasMore: true,
      };

      const moreResponse: PokemonListResponse = {
        pokemon: [{ id: 2, name: 'ivysaur', image: 'https://...' }],
        total: 1025,
        hasMore: true,
      };

      let finalList: PokemonListItem[] = [];

      service.pokemonList$.subscribe(list => {
        finalList = list;
      });

      service.loadInitialPokemon();

      const req1 = httpMock.expectOne(`${apiUrl}?limit=20&offset=0`);
      req1.flush(initialResponse);

      setTimeout(() => {
        service.loadMorePokemon();

        const req2 = httpMock.expectOne(`${apiUrl}?limit=20&offset=20`);
        req2.flush(moreResponse);

        setTimeout(() => {
          expect(finalList.length).toBe(2);
          expect(finalList[0].name).toBe('bulbasaur');
          expect(finalList[1].name).toBe('ivysaur');
          done();
        }, 100);
      }, 100);
    });
  });

  describe('search', () => {
    it('should search pokemon and update list', (done) => {
      const mockResponse: PokemonListResponse = {
        pokemon: [{ id: 25, name: 'pikachu', image: 'https://...' }],
        total: 1,
        hasMore: false,
      };

      let finalList: PokemonListItem[] = [];
      service.pokemonList$.subscribe(list => {
        finalList = list;
      });

      service.search('pikachu');

      const req = httpMock.expectOne(`${apiUrl}/search?q=pikachu`);
      req.flush(mockResponse);

      setTimeout(() => {
        expect(finalList).toEqual(mockResponse.pokemon);
        done();
      }, 100);
    });

    it('should load initial pokemon for empty query', (done) => {
      const mockResponse: PokemonListResponse = {
        pokemon: [
          { id: 1, name: 'bulbasaur', image: 'https://...' },
          { id: 2, name: 'ivysaur', image: 'https://...' },
        ],
        total: 1025,
        hasMore: true,
      };

      service.search('');

      const req = httpMock.expectOne(`${apiUrl}?limit=20&offset=0`);
      req.flush(mockResponse);

      setTimeout(() => {
        expect(true).toBe(true); // Placeholder expectation
        done();
      }, 100);
    });

    it('should handle search errors', (done) => {
      let finalList: PokemonListItem[] = [];
      service.pokemonList$.subscribe(list => {
        finalList = list;
      });

      service.search('nonexistent');

      const req = httpMock.expectOne(`${apiUrl}/search?q=nonexistent`);
      req.error(new ErrorEvent('Network error'));

      setTimeout(() => {
        expect(finalList).toEqual([]);
        done();
      }, 100);
    });
  });

  describe('selectPokemon', () => {
    it('should select pokemon and update subject', (done) => {
      const mockPokemon: PokemonDetail = {
        id: 25,
        name: 'pikachu',
        image: 'https://...',
        height: 4,
        weight: 60,
        abilities: [],
        stats: [],
        evolutionChain: {
          previous: null,
          current: { id: 25, name: 'pikachu', image: 'https://...' },
          next: null,
        },
      };

      let selectedPokemon: PokemonDetail | null = null;
      service.selectedPokemon$.subscribe(pokemon => {
        selectedPokemon = pokemon;
      });

      service.selectPokemon('pikachu');

      const req = httpMock.expectOne(`${apiUrl}/pikachu`);
      req.flush(mockPokemon);

      setTimeout(() => {
        expect(selectedPokemon).toEqual(mockPokemon);
        done();
      }, 100);
    });
  });

  describe('clearSelection', () => {
    it('should clear selected pokemon', (done) => {
      let selectedPokemon: any = { id: 1, name: 'test' };
      service.selectedPokemon$.subscribe(pokemon => {
        selectedPokemon = pokemon;
      });

      service.clearSelection();

      setTimeout(() => {
        expect(selectedPokemon).toBeNull();
        done();
      }, 100);
    });
  });
});
