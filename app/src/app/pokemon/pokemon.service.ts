import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { PokemonListResponse, PokemonDetail, PokemonListItem } from "./pokemon.models";

@Injectable()
export class PokemonService {
  private apiUrl = "http://localhost:3000/api/pokemon";

  private pokemonListSubject = new BehaviorSubject<PokemonListItem[]>([]);
  public pokemonList$ = this.pokemonListSubject.asObservable();

  private selectedPokemonSubject = new BehaviorSubject<PokemonDetail | null>(null);
  public selectedPokemon$ = this.selectedPokemonSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private currentOffset = 0;

  constructor(private http: HttpClient) {}

  getPokemonList(limit: number, offset: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  getPokemonByName(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.apiUrl}/${name}`);
  }

  searchPokemon(query: string): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.apiUrl}/search?q=${query}`);
  }

  loadInitialPokemon(): void {
    this.isLoadingSubject.next(true);
    this.getPokemonList(20, 0).subscribe({
      next: (response) => {
        this.pokemonListSubject.next(response.pokemon);
        this.currentOffset = 20;
        this.isLoadingSubject.next(false);
      },
      error: () => {
        this.isLoadingSubject.next(false);
      }
    });
  }

  loadMorePokemon(): void {
    this.isLoadingSubject.next(true);
    this.getPokemonList(20, this.currentOffset).subscribe({
      next: (response) => {
        const currentList = this.pokemonListSubject.value;
        this.pokemonListSubject.next([...currentList, ...response.pokemon]);
        this.currentOffset += 20;
        this.isLoadingSubject.next(false);
      },
      error: () => {
        this.isLoadingSubject.next(false);
      }
    });
  }

  search(query: string): void {
    if (!query.trim()) {
      this.loadInitialPokemon();
      return;
    }

    this.isLoadingSubject.next(true);
    this.searchPokemon(query).subscribe({
      next: (response) => {
        this.pokemonListSubject.next(response.pokemon);
        this.currentOffset = 0;
        this.isLoadingSubject.next(false);
      },
      error: () => {
        this.pokemonListSubject.next([]);
        this.isLoadingSubject.next(false);
      }
    });
  }

  selectPokemon(name: string): void {
    this.getPokemonByName(name).subscribe({
      next: (pokemon) => {
        this.selectedPokemonSubject.next(pokemon);
      }
    });
  }

  clearSelection(): void {
    this.selectedPokemonSubject.next(null);
  }
}
