import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Server } from 'http';
import { AppModule } from './modules/app.module';
import { NodeEnvEnum } from './common/enums';
import { setupSwagger } from './common/config';
import { handleLocalEnvironment } from './common/utils';
import { Request, Response } from 'express';

let server: Server;

async function bootstrap(): Promise<Server | void> {
  const app: NestApplication = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);
  const basePort = configService.get<number>('PORT') ?? 3000;
  const environment = configService.get<string>('NODE_ENV') || 'local';
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const isVercel = configService.get<string>('VERCEL') === 'false';

  const appEnvironment = Object.values(NodeEnvEnum).includes(
    environment as NodeEnvEnum,
  )
    ? (environment as NodeEnvEnum)
    : NodeEnvEnum.LOCAL;

  app.setGlobalPrefix(apiPrefix);
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

  setupSwagger(app);

  if (isVercel) {
    await app.init();
    return app.getHttpAdapter().getInstance();
  }

  if (appEnvironment === NodeEnvEnum.LOCAL) {
    await handleLocalEnvironment(app, basePort);
  } else {
    await app.listen(basePort);
    console.log(
      `Application is running on port: http://localhost:${basePort} in ${environment} environment`,
    );
    console.log(
      `Swagger documentation: http://localhost:${basePort}/${process.env.SWAGGER_PATH || 'api/docs'}`,
    );
  }
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!server) {
    const instance = (await bootstrap()) as Server;
    if (instance) {
      server = instance;
    }
  }
  if (server) {
    server.emit('request', req, res);
  }
}
