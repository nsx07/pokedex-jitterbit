import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonListComponent } from './pokemon-list.component';
import { PokemonService } from './pokemon.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { PokemonListItem } from './pokemon.models';
import { provideRouter } from '@angular/router';

describe('PokemonListComponent', () => {
  let component: PokemonListComponent;
  let fixture: ComponentFixture<PokemonListComponent>;
  let mockPokemonService: any;

  const mockPokemonList: PokemonListItem[] = [
    { id: 1, name: 'bulbasaur', image: 'https://...' },
    { id: 2, name: 'ivysaur', image: 'https://...' },
    { id: 3, name: 'venusaur', image: 'https://...' },
  ];

  beforeEach(async () => {
    mockPokemonService = {
      pokemonList$: new BehaviorSubject<PokemonListItem[]>(mockPokemonList),
      isLoading$: new BehaviorSubject<boolean>(false),
      selectedPokemon$: new BehaviorSubject(null),
      loadInitialPokemon: jasmine.createSpy('loadInitialPokemon'),
      loadMorePokemon: jasmine.createSpy('loadMorePokemon'),
      search: jasmine.createSpy('search'),
    };

    await TestBed.configureTestingModule({
      imports: [PokemonListComponent],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should load initial pokemon on init', () => {
      fixture.detectChanges();

      expect(mockPokemonService.loadInitialPokemon).toHaveBeenCalled();
    });
  });

  describe('loadMore', () => {
    it('should call service loadMorePokemon', () => {
      component.loadMore();

      expect(mockPokemonService.loadMorePokemon).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    it('should search for pokemon with search query', () => {
      component.searchQuery = 'pikachu';

      component.onSearch();

      expect(component.isSearchActive).toBe(true);
      expect(mockPokemonService.search).toHaveBeenCalledWith('pikachu');
    });

    it('should not search with empty query', () => {
      component.searchQuery = '';

      component.onSearch();

      expect(mockPokemonService.search).not.toHaveBeenCalled();
      expect(component.isSearchActive).toBe(false);
    });

    it('should not search with whitespace only query', () => {
      component.searchQuery = '   ';

      component.onSearch();

      expect(mockPokemonService.search).not.toHaveBeenCalled();
      expect(component.isSearchActive).toBe(false);
    });

    it('should trim search query before checking', () => {
      component.searchQuery = '  pikachu  ';

      component.onSearch();

      expect(component.isSearchActive).toBe(true);
      expect(mockPokemonService.search).toHaveBeenCalledWith('  pikachu  ');
    });
  });

  describe('clearSearch', () => {
    it('should clear search query and reset state', () => {
      component.searchQuery = 'pikachu';
      component.isSearchActive = true;

      component.clearSearch();

      expect(component.searchQuery).toBe('');
      expect(component.isSearchActive).toBe(false);
      expect(mockPokemonService.loadInitialPokemon).toHaveBeenCalled();
    });
  });

  describe('onImageError', () => {
    it('should set placeholder image on error', () => {
      const mockImg = document.createElement('img');
      mockImg.src = 'https://real-image.com/pokemon.png';

      const event = new Event('error');
      Object.defineProperty(event, 'target', {
        value: mockImg,
        enumerable: true,
      });

      component.onImageError(event);

      expect(mockImg.src).toBe('https://via.placeholder.com/160?text=No+Image');
    });

    it('should handle image error gracefully', () => {
      const mockImg = document.createElement('img');
      const event = new Event('error');
      Object.defineProperty(event, 'target', {
        value: mockImg,
        enumerable: true,
      });

      expect(() => {
        component.onImageError(event);
      }).not.toThrow();
    });
  });

  describe('Component properties', () => {
    it('should have pokemonList$ observable', () => {
      expect(component.pokemonList$).toBeDefined();
      let listValue: PokemonListItem[] = [];
      component.pokemonList$.subscribe(list => {
        listValue = list;
      });
      expect(listValue).toEqual(mockPokemonList);
    });

    it('should have isLoading$ observable', () => {
      expect(component.isLoading$).toBeDefined();
      let loadingValue = false;
      component.isLoading$.subscribe(loading => {
        loadingValue = loading;
      });
      expect(typeof loadingValue).toBe('boolean');
    });

    it('should initialize with empty search query', () => {
      expect(component.searchQuery).toBe('');
    });

    it('should initialize with isSearchActive false', () => {
      expect(component.isSearchActive).toBe(false);
    });
  });

  describe('Template behavior', () => {
    it('should display pokemon list', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Pokédex');
    });

    it('should show clear button only when search is active', () => {
      component.isSearchActive = false;
      fixture.detectChanges();

      let clearButton = fixture.nativeElement.querySelector(
        '[ng-reflect-label="Clear"]',
      );
      expect(clearButton).toBeFalsy();

      component.isSearchActive = true;
      fixture.detectChanges();

      clearButton = fixture.nativeElement.querySelector(
        '[ng-reflect-label="Clear"]',
      );
      expect(clearButton).toBeTruthy();
    });

    it('should show load more button only when not searching', () => {
      component.isSearchActive = false;
      fixture.detectChanges();

      let loadMoreButton = fixture.nativeElement.querySelector(
        '[ng-reflect-label="Load More"]',
      );
      expect(loadMoreButton).toBeTruthy();

      component.isSearchActive = true;
      fixture.detectChanges();

      loadMoreButton = fixture.nativeElement.querySelector(
        '[ng-reflect-label="Load More"]',
      );
      expect(loadMoreButton).toBeFalsy();
    });
  });

  describe('Loading states', () => {
    it('should show loading message when list is empty and not searching', () => {
      mockPokemonService.pokemonList$.next([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Loading Pokémon');
    });

    it('should show no results message when search returns empty', () => {
      component.isSearchActive = true;
      component.searchQuery = 'nonexistent';
      mockPokemonService.pokemonList$.next([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('No Pokémon found');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete search flow', () => {
      expect(component.isSearchActive).toBe(false);

      component.searchQuery = 'pikachu';
      component.onSearch();

      expect(component.isSearchActive).toBe(true);
      expect(mockPokemonService.search).toHaveBeenCalledWith('pikachu');

      // Reset the spy before calling clearSearch
      mockPokemonService.loadInitialPokemon.calls.reset();

      component.clearSearch();

      expect(component.searchQuery).toBe('');
      expect(component.isSearchActive).toBe(false);
      expect(mockPokemonService.loadInitialPokemon).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination flow', () => {
      fixture.detectChanges();

      expect(mockPokemonService.loadInitialPokemon).toHaveBeenCalled();

      component.loadMore();

      expect(mockPokemonService.loadMorePokemon).toHaveBeenCalled();
    });
  });
});
