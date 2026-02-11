import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Pokédex</h1>
          <p class="text-lg text-gray-600">Discover and explore Pokémon</p>
        </div>

        <!-- Test Card -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <p-card *ngFor="let pokemon of testPokemon" class="h-full">
            <ng-template pTemplate="header">
              <div class="w-full h-48 bg-gradient-to-b from-indigo-400 to-blue-400 flex items-center justify-center">
                <span class="text-6xl">{{ pokemon.emoji }}</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="text-center">
                <h3 class="text-xl font-bold text-gray-900 capitalize mb-2">{{ pokemon.name }}</h3>
                <p class="text-sm text-gray-600 mb-4">Pokémon ID: {{ pokemon.id }}</p>
                <div class="flex flex-wrap gap-2 justify-center mb-4">
                  <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                    *ngFor="let type of pokemon.types">
                    {{ type }}
                  </span>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="footer">
              <div class="flex gap-2 w-full">
                <p-button label="Details" icon="pi pi-arrow-right" class="flex-1" styleClass="p-button-outlined" />
                <p-button icon="pi pi-heart" class="p-button-rounded p-button-text" />
              </div>
            </ng-template>
          </p-card>
        </div>

        <!-- Button Test -->
        <div class="mt-12 flex gap-4 flex-wrap justify-center">
          <p-button label="Load More" icon="pi pi-download" />
          <p-button label="Danger" severity="danger" icon="pi pi-times" />
          <p-button label="Success" severity="success" icon="pi pi-check" />
          <p-button label="Submit" />
          <button pButton>TESTE</button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PokemonListComponent implements OnInit {
  testPokemon = [
    { id: 1, name: 'Bulbasaur', emoji: '🌿', types: ['Grass', 'Poison'] },
    { id: 4, name: 'Charmander', emoji: '🔥', types: ['Fire'] },
    { id: 7, name: 'Squirtle', emoji: '💧', types: ['Water'] },
    { id: 25, name: 'Pikachu', emoji: '⚡', types: ['Electric'] },
    { id: 39, name: 'Jigglypuff', emoji: '🎤', types: ['Normal', 'Fairy'] },
    { id: 54, name: 'Psyduck', emoji: '🦆', types: ['Water'] },
  ];

  ngOnInit() {
    console.log('Pokemon List Component initialized - Tailwind + PrimeNG working!');
  }
}
