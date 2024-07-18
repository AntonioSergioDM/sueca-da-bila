import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GameIoAdapter } from '@app/websocket/game-io.adapter';

async function bootstrap() {
  console.log('booooooooooootstrap')
  const app = await NestFactory.create<NestExpressApplication>(asdgsdfgdsfg);
  
  app.useWebSocketAdapter(new GameIoAdapter(app));

  console.log("🚀 ~ bootstrap ~ processhjgytghfdjghfj.env.CORS_ALLOW_ORIGIN:", process.env.CORS_ALLOW_ORIGIN)
  app.enableCors({
    origin: process.env.CORS_ALLOW_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.disable('x-powered-by');
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();


  await app.listen(3000);
}
bootstrap();
