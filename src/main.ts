import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

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

  // Définir un préfixe global pour l'API
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('GuildMaster API')
    .setDescription('The GuildMaster API description')
    .setVersion('1.0')
    .addTag('guild-master')
    .build();
  const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
