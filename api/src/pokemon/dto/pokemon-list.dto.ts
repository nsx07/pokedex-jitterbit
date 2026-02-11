export class PokemonListItemDto {
  id!: number;
  name!: string;
  image!: string;
}

export class PokemonListResponseDto {
  pokemon!: PokemonListItemDto[];
  total!: number;
  hasMore!: boolean;
}
