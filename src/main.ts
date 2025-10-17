import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Express } from 'express';

let cachedServer: Express;

async function bootstrapServer() {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, {
      rawBody: true,
      bodyParser: true,
    });

    app.use(cookieParser());

    //CORS ENABLE
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
    cachedServer = expressApp;
  }
  return cachedServer;
}

// For Vercel serverless
export default async (req: any, res: any) => {
  const server = await bootstrapServer();
  return server(req, res);
};

// For traditional deployment (Render, etc)
if (require.main === module) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      rawBody: true,
      bodyParser: true,
    });

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

    await app.listen(process.env.PORT ?? 8000);
  }
  bootstrap();
}
