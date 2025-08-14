import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from 'src/modules/app.module';
import { NodeEnvEnum } from 'src/common/enums';
import { handleLocalEnvironment } from 'src/common/utils';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);
  const basePort = configService.get<number>('PORT') ?? 3000;

  const environment = configService.get<string>('NODE_ENV') || 'local';
  const appEnvironment = Object.values(NodeEnvEnum).includes(
    environment as NodeEnvEnum,
  )
    ? (environment as NodeEnvEnum)
    : NodeEnvEnum.LOCAL;

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  if (appEnvironment === NodeEnvEnum.LOCAL) {
    await handleLocalEnvironment(app, basePort);
  } else {
    await app.listen(basePort);
    console.log(
      `Application is running on port: ${basePort} in ${environment} environment`,
    );
  }
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
