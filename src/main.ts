import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 8001;

  await app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}/api`);
  });
}
bootstrap();
