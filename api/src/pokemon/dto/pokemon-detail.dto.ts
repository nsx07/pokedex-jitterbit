export class AbilityDto {
  name!: string;
  hidden!: boolean;
}

export class StatDto {
  name!: string;
  baseStat!: number;
}

export class EvolutionDto {
  id!: number;
  name!: string;
  image!: string;
}

export class EvolutionChainDto {
  previous!: EvolutionDto | null;
  current!: EvolutionDto;
  next!: EvolutionDto | null;
}

export class PokemonDetailDto {
  id!: number;
  name!: string;
  image!: string;
  height!: number;
  weight!: number;
  abilities!: AbilityDto[];
  stats!: StatDto[];
  evolutionChain!: EvolutionChainDto;
}
