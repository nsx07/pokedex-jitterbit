import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Observable } from 'rxjs';
import { PokemonService } from './pokemon.service';
import { PokemonDetail } from './pokemon.models';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, ProgressBarModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <div class="mb-6">
          <p-button
            label="← Back to List"
            severity="secondary"
            routerLink="/"
            styleClass="p-button-text"
          />
        </div>

        <div *ngIf="pokemon$ | async as pokemon" class="flex flex-col gap-4">
          <!-- Header Card -->
          <p-card>
            <ng-template pTemplate="header">
              <div class="w-full h-64 bg-gradient-to-b from-indigo-400 to-blue-400 flex items-center justify-center">
                <img
                  [src]="pokemon.image"
                  [alt]="pokemon.name"
                  class="h-56 w-56 object-contain"
                  (error)="onImageError($event)"
                />
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="text-center">
                <h1 class="text-4xl font-bold text-gray-900 capitalize mb-2">{{ pokemon.name }}</h1>
                <p class="text-lg text-gray-600 mb-4">Pokémon ID: {{ pokemon.id }}</p>
              </div>
            </ng-template>
          </p-card>

          <!-- Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Height & Weight -->
            <p-card>
              <ng-template pTemplate="header">
                <h2 class="text-xl font-bold text-gray-900 p-4">Physical Attributes</h2>
              </ng-template>
              <ng-template pTemplate="content">
                <div class="space-y-4">
                  <div>
                    <p class="text-gray-600 text-sm">Height</p>
                    <p class="text-2xl font-semibold text-indigo-600">{{ (pokemon.height / 10).toFixed(1) }} m</p>
                  </div>
                  <div>
                    <p class="text-gray-600 text-sm">Weight</p>
                    <p class="text-2xl font-semibold text-indigo-600">{{ (pokemon.weight / 10).toFixed(1) }} kg</p>
                  </div>
                </div>
              </ng-template>
            </p-card>

            <!-- Abilities -->
            <p-card>
              <ng-template pTemplate="header">
                <h2 class="text-xl font-bold text-gray-900 p-4">Abilities</h2>
              </ng-template>
              <ng-template pTemplate="content">
                <div class="space-y-2">
                  <div *ngFor="let ability of pokemon.abilities" class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold capitalize">
                      {{ ability.name }}
                    </span>
                    <span *ngIf="ability.hidden" class="text-xs text-gray-500">(Hidden)</span>
                  </div>
                  <p *ngIf="pokemon.abilities.length === 0" class="text-gray-500">No abilities available</p>
                </div>
              </ng-template>
            </p-card>
          </div>

          <!-- Stats -->
          <p-card>
            <ng-template pTemplate="header">
              <h2 class="text-xl font-bold text-gray-900 p-4">Base Stats</h2>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="space-y-4">
                <div *ngFor="let stat of pokemon.stats" class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="capitalize font-semibold text-gray-700">{{ formatStatName(stat.name) }}</span>
                    <span class="text-indigo-600 font-bold">{{ stat.baseStat }}</span>
                  </div>
                  <p-progressBar
                    [value]="stat.baseStat"
                  />
                </div>
              </div>
            </ng-template>
          </p-card>

          <!-- Evolution Chain -->
          <p-card>
            <ng-template pTemplate="header">
              <h2 class="text-xl font-bold text-gray-900 p-4">Evolution Chain</h2>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="flex items-center justify-center gap-4 flex-wrap">
                <!-- Previous Evolution -->
                <div
                  *ngIf="pokemon.evolutionChain.previous"
                  class="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  [routerLink]="['/pokemon', pokemon.evolutionChain.previous.name]"
                >
                  <img
                    [src]="pokemon.evolutionChain.previous.image"
                    [alt]="pokemon.evolutionChain.previous.name"
                    class="h-24 w-24 object-contain mx-auto mb-2"
                    (error)="onImageError($event)"
                  />
                  <p class="capitalize font-semibold text-sm text-gray-700">{{ pokemon.evolutionChain.previous.name }}</p>
                </div>

                <!-- Arrow -->
                <div *ngIf="pokemon.evolutionChain.previous" class="text-2xl text-indigo-600">→</div>

                <!-- Current Evolution -->
                <div class="text-center">
                  <div class="h-24 w-24 mx-auto mb-2 flex items-center justify-center bg-indigo-50 rounded-lg">
                    <img
                      [src]="pokemon.evolutionChain.current.image"
                      [alt]="pokemon.evolutionChain.current.name"
                      class="h-24 w-24 object-contain"
                      (error)="onImageError($event)"
                    />
                  </div>
                  <p class="capitalize font-semibold text-sm text-gray-700">{{ pokemon.evolutionChain.current.name }}</p>
                  <span class="text-xs text-gray-500">(Current)</span>
                </div>

                <!-- Arrow -->
                <div *ngIf="pokemon.evolutionChain.next" class="text-2xl text-indigo-600">→</div>

                <!-- Next Evolution -->
                <div
                  *ngIf="pokemon.evolutionChain.next"
                  class="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  [routerLink]="['/pokemon', pokemon.evolutionChain.next.name]"
                >
                  <img
                    [src]="pokemon.evolutionChain.next.image"
                    [alt]="pokemon.evolutionChain.next.name"
                    class="h-24 w-24 object-contain mx-auto mb-2"
                    (error)="onImageError($event)"
                  />
                  <p class="capitalize font-semibold text-sm text-gray-700">{{ pokemon.evolutionChain.next.name }}</p>
                </div>

                <!-- No Evolution -->
                <div *ngIf="!pokemon.evolutionChain.previous && !pokemon.evolutionChain.next" class="text-gray-500">
                  This Pokémon cannot evolve.
                </div>
              </div>
            </ng-template>
          </p-card>
        </div>

        <!-- Loading State -->
        <div *ngIf="!(pokemon$ | async)" class="text-center py-12">
          <p class="text-gray-600 text-lg">Loading Pokémon details...</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PokemonDetailComponent implements OnInit {
  pokemon$!: Observable<PokemonDetail>;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.pokemon$ = this.pokemonService.getPokemonByName(params['name']);
      }
    });
  }

  formatStatName(statName: string): string {
    const mapping: { [key: string]: string } = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'sp-attack': 'Sp. Attack',
      'sp-defense': 'Sp. Defense',
      'speed': 'Speed',
    };
    return mapping[statName] || statName;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/160?text=No+Image';
  }
}
