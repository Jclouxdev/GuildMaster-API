import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette si des propriétés inattendues
      transform: true, // Transforme automatiquement les types
    }),
  );
  app.enableCors(); // Active CORS pour toutes les origines
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
