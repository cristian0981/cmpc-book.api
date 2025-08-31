import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/exceptions-filter/all-exception.filter';
import { envs } from './settings/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Configurar cookie parser
  app.use(cookieParser());
  
  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,

  });
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('CMPC Bookstore API')
    .setDescription('API para el sistema de librería CMPC')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('access_token', {
      type: 'http',
      in: 'cookie',
      scheme: 'bearer',
    })
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  await app.listen(envs.port);
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${envs.port}`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${envs.port}/api/docs`);
}
bootstrap();
