import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { PokemonListResponseDto, PokemonListItemDto } from './dto/pokemon-list.dto';
import { PokemonDetailDto, StatDto, AbilityDto, EvolutionChainDto, EvolutionDto } from './dto/pokemon-detail.dto';

@Injectable()
export class PokemonService {
  constructor(@Inject("REDIS_CLIENT") private redisService: RedisService, private config: ConfigService) {}

  private async fetchFromPokeAPI(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return response.json();
  }

  async getRawPokemonByName(name: string) {
    try {
      const response = await fetch(`${this.config.get("POKEAPI_URL")}/pokemon/${name.toLowerCase()}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(`Pokemon "${name}" not found`, HttpStatus.NOT_FOUND);
        }
        throw new Error(`API returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to fetch Pokemon data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPokemonByName(name: string): Promise<PokemonDetailDto> {
    const cacheKey = `pokemon:detail:${name.toLowerCase()}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const pokemonData = await this.getRawPokemonByName(name);
      const detail = await this.formatPokemonDetail(pokemonData);
      await this.redisService.set(cacheKey, JSON.stringify(detail));
      return detail;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to fetch Pokemon data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchPokemon(query: string): Promise<PokemonListResponseDto> {
    try {
      const detail = await this.getPokemonByName(query);
      return {
        pokemon: [{
          id: detail.id,
          name: detail.name,
          image: detail.image,
        }],
        total: 1,
        hasMore: false,
      };
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 404) {
        return {
          pokemon: [],
          total: 0,
          hasMore: false,
        };
      }
      throw error;
    }
  }

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponseDto> {
    const cacheKey = `pokemon:list:${limit}:${offset}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const url = new URL(`${this.config.get("POKEAPI_URL")}/pokemon`);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('offset', offset.toString());

      const data = await this.fetchFromPokeAPI(url.toString());

      const pokemon: PokemonListItemDto[] = data.results.map((p: any) => ({
        id: this.extractIdFromUrl(p.url),
        name: p.name,
        image: this.getImageUrl(this.extractIdFromUrl(p.url)),
      }));

      const result: PokemonListResponseDto = {
        pokemon,
        total: data.count,
        hasMore: data.next !== null,
      };

      await this.redisService.set(cacheKey, JSON.stringify(result));
      return result;
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon list', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private extractIdFromUrl(url: string): number {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? parseInt(match[1], 10) : 0;
  }

  private getImageUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  private async formatPokemonDetail(pokemonData: any): Promise<PokemonDetailDto> {
    const id = pokemonData.id;
    const name = pokemonData.name;
    const image = this.getImageUrl(id);
    const height = pokemonData.height;
    const weight = pokemonData.weight;

    const abilities: AbilityDto[] = pokemonData.abilities.map((a: any) => ({
      name: a.ability.name,
      hidden: a.is_hidden,
    }));

    const stats: StatDto[] = pokemonData.stats.map((s: any) => ({
      name: s.stat.name,
      baseStat: s.base_stat,
    }));

    const evolutionChain = await this.getEvolutionChain(id);

    return {
      id,
      name,
      image,
      height,
      weight,
      abilities,
      stats,
      evolutionChain,
    };
  }

  private async getEvolutionChain(pokemonId: number): Promise<EvolutionChainDto> {
    try {
      const speciesUrl = `${this.config.get("POKEAPI_URL")}/pokemon-species/${pokemonId}`;
      const speciesData = await this.fetchFromPokeAPI(speciesUrl);

      if (!speciesData.evolution_chain) {
        return {
          previous: null,
          current: { id: pokemonId, name: '', image: '' },
          next: null,
        };
      }

      const chainUrl = speciesData.evolution_chain.url;
      const chainData = await this.fetchFromPokeAPI(chainUrl);

      const current = {
        id: pokemonId,
        name: speciesData.name,
        image: this.getImageUrl(pokemonId)
      };

      const evolutionMap = await this.flattenEvolutionChain(chainData.chain);
      const currentIndex = evolutionMap.findIndex(e => e.id === pokemonId);

      return {
        previous: currentIndex > 0 ? evolutionMap[currentIndex - 1] : null,
        current,
        next: currentIndex < evolutionMap.length - 1 ? evolutionMap[currentIndex + 1] : null,
      };
    } catch (error) {
      return {
        previous: null,
        current: { id: pokemonId, name: '', image: '' },
        next: null,
      };
    }
  }

  private async flattenEvolutionChain(chain: any): Promise<EvolutionDto[]> {
    const result: EvolutionDto[] = [];

    const processChain = async (node: any) => {
      const speciesName = node.species.name;
      const speciesData = await this.fetchFromPokeAPI(`${this.config.get("POKEAPI_URL")}/pokemon/${speciesName}`);

      result.push({
        id: speciesData.id,
        name: speciesName,
        image: this.getImageUrl(speciesData.id),
      });

      if (node.evolves_to && node.evolves_to.length > 0) {
        await processChain(node.evolves_to[0]);
      }
    };

    await processChain(chain);
    return result;
  }

  async getPaginated(limit: number = 20, offset: number = 0) {
    try {
      const result = await this.getPokemonList(limit, offset);

      return {
        data: result.pokemon,
        pagination: {
          offset,
          limit,
          total: result.total,
          hasMore: result.hasMore,
          nextOffset: offset + limit,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
