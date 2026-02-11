import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PokemonService } from './pokemon.service';
import { PokemonListItem } from './pokemon.models';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, CardModule, InputTextModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Pokédex</h1>
          <p class="text-lg text-gray-600">Discover and explore Pokémon</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-8">
          <div class="flex gap-3">
            <input
              type="text"
              pInputText
              placeholder="Search Pokémon by name..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              class="flex-1"
            />
            <p-button
              label="Search"
              icon="pi pi-search"
              (click)="onSearch()"
              [loading]="isLoading$ | async"
            />
            <p-button
              *ngIf="isSearchActive"
              label="Clear"
              icon="pi pi-times"
              severity="secondary"
              (click)="clearSearch()"
            />
          </div>
        </div>

        <!-- Pokemon Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <p-card *ngFor="let pokemon of (pokemonList$ | async)" class="h-full cursor-pointer hover:shadow-lg transition-shadow" [routerLink]="['/pokemon', pokemon.name]">
            <ng-template pTemplate="header">
              <div class="w-full h-48 bg-gradient-to-b from-indigo-400 to-blue-400 flex items-center justify-center">
                <img
                  [src]="pokemon.image"
                  [alt]="pokemon.name"
                  class="h-40 w-40 object-contain"
                  (error)="onImageError($event)"
                />
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="text-center">
                <h3 class="text-xl font-bold text-gray-900 capitalize mb-2">{{ pokemon.name }}</h3>
                <p class="text-sm text-gray-600 mb-4">Pokémon ID: {{ pokemon.id }}</p>
              </div>
            </ng-template>
            <ng-template pTemplate="footer">
              <div class="flex gap-2 w-full">
                <p-button
                  label="Details"
                  icon="pi pi-arrow-right"
                  class="flex-1"
                  styleClass="p-button-outlined"
                  [routerLink]="['/pokemon', pokemon.name]"
                />
                <p-button icon="pi pi-heart" class="p-button-rounded p-button-text" />
              </div>
            </ng-template>
          </p-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="(pokemonList$ | async)?.length === 0 && !isSearchActive" class="text-center py-12">
          <p class="text-gray-600 text-lg">Loading Pokémon...</p>
        </div>

        <div *ngIf="(pokemonList$ | async)?.length === 0 && isSearchActive" class="text-center py-12">
          <p class="text-gray-600 text-lg">No Pokémon found matching "{{ searchQuery }}"</p>
        </div>

        <!-- Load More Button -->
        <div *ngIf="!isSearchActive" class="flex justify-center">
          <p-button
            label="Load More"
            icon="pi pi-download"
            (click)="loadMore()"
            [loading]="isLoading$ | async"
          />
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PokemonListComponent implements OnInit {
  pokemonList$ = this.pokemonService.pokemonList$;
  isLoading$ = this.pokemonService.isLoading$;

  searchQuery = '';
  isSearchActive = false;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.pokemonService.loadInitialPokemon();
  }

  loadMore() {
    this.pokemonService.loadMorePokemon();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.isSearchActive = true;
      this.pokemonService.search(this.searchQuery);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearchActive = false;
    this.pokemonService.loadInitialPokemon();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/160?text=No+Image';
  }
}
