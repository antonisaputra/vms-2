import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow frontend communication
  app.enableCors({
    // origin: 'https://vms.hamzanwadi.ac.id',
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


  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  // Listen on all IPv4 interfaces to ensure connectivity from frontend
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();