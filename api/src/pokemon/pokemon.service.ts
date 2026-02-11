import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  constructor(@Inject("REDIS_CLIENT") private redisService: RedisService, private config: ConfigService) {}

  async getPokemonByName(name: string) {
    const cacheKey = `pokemon:${name.toLowerCase()}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(`${this.config.get("POKEAPI_URL")}/pokemon/${name.toLowerCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(`Pokemon "${name}" not found`, HttpStatus.NOT_FOUND);
        }
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      await this.redisService.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPokemonList(limit: number = 20, offset: number = 0) {
    const cacheKey = `pokemon:list:${limit}:${offset}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const url = new URL(`${this.config.get("POKEAPI_URL")}/pokemon`);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('offset', offset.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      await this.redisService.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon list', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPaginated(limit: number = 20, offset: number = 0) {
    try {
      const data = await this.getPokemonList(limit, offset);
      
      return {
        data: data.results,
        pagination: {
          offset,
          limit,
          total: data.count,
          hasMore: data.next !== null,
          nextOffset: offset + limit,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
