import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private pokemonService: PokemonService) {}

  @Get('paginated')
  getPaginated(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.pokemonService.getPaginated(Number(limit), Number(offset));
  }

  @Get('search')
  searchPokemon(@Query('q') query: string) {
    return this.pokemonService.searchPokemon(query);
  }

  @Get(':name')
  getPokemonByName(@Param('name') name: string) {
    return this.pokemonService.getPokemonByName(name);
  }

  @Get()
  getPokemonList(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.pokemonService.getPokemonList(Number(limit), Number(offset));
  }
}
