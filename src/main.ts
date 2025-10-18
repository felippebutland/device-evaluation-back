// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Configurar CORS
  const corsOrigins = [
    configService.get<string>('FRONTEND_URL'),
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar prefixo global da API
  app.setGlobalPrefix('api/v1');

  // Pipe global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);

  console.log(`🚀 Sistema de Avaliação de Dispositivos iniciado na porta ${port}`);
  console.log(`📊 API disponível em: http://localhost:${port}/api/v1`);
  console.log(`🔌 MongoDB: ${configService.get<string>('MONGODB_URI')}`);
}

bootstrap().catch((error) => {
  console.error('❌ Erro ao iniciar aplicação:', error);
  process.exit(1);
});
