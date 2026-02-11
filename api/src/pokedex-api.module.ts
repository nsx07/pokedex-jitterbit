import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon/pokemon.controller';
import { PokemonService } from './pokemon/pokemon.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule.forRoot(), RedisModule],
  controllers: [PokemonController, HealthController],
  providers: [PokemonService],
})
export class PokedexApiModule {}
