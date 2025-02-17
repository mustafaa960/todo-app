import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './common/filters/CatchEverything.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages: false,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
 
  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}/graphql`);
}
bootstrap();
