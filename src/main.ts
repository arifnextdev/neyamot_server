import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  // app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
