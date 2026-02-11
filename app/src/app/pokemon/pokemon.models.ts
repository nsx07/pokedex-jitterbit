export interface PokemonListItem {
  id: number;
  name: string;
  image: string;
}

export interface PokemonListResponse {
  pokemon: PokemonListItem[];
  total: number;
  hasMore: boolean;
}

export interface Ability {
  name: string;
  hidden: boolean;
}

export interface Stat {
  name: string;
  baseStat: number;
}

export interface EvolutionForm {
  id: number;
  name: string;
  image: string;
}

export interface EvolutionChain {
  previous: EvolutionForm | null;
  current: EvolutionForm;
  next: EvolutionForm | null;
}

export interface PokemonDetail {
  id: number;
  name: string;
  image: string;
  height: number;
  weight: number;
  abilities: Ability[];
  stats: Stat[];
  evolutionChain: EvolutionChain;
}
