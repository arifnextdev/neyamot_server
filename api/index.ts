import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

const expressApp = express();
let cachedApp: any;

async function createNestApp() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        rawBody: true,
        bodyParser: true,
      }
    );

    app.use(cookieParser());

    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  await createNestApp();
  return expressApp(req, res);
};
