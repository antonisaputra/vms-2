import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS to allow frontend communication
  app.enableCors({
    origin: 'http://localhost:5173', // Explicitly allow the frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set a global prefix for all routes (e.g., /api/members)
  app.setGlobalPrefix('api');

  // Use global pipes for automatic request validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have any decorators
    transform: true, // Automatically transform payloads to DTO instances
  }));

  // Listen on all IPv4 interfaces to ensure connectivity from frontend
  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();