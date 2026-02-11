import { NestFactory } from '@nestjs/core';
import { PokedexApiModule } from './pokedex-api.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(PokedexApiModule);
  app.setGlobalPrefix('api');
  app.use(cors(
    {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
  ));
  await app.listen(3000);
}

bootstrap();
