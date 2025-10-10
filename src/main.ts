import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { 
        enableImplicitConversion: true 
      },
  }));

  const config = new DocumentBuilder()
    .setTitle('LSI Backend API')
    .setDescription('LSI Backend API')
    .setVersion('1.0')
    .addTag('LSI Backend')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  //Enable CORS for your Next.js frontend
  app.enableCors({
    origin: true, // allow all origins
    credentials: false, // must be false when origin is '*'
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
