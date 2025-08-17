import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './common/config';
import { NodeEnvEnum } from './common/enums';
import { handleLocalEnvironment } from './common/utils';
import { AppModule } from './modules/app.module';
import type { Request, Response, NextFunction } from 'express';

let app: NestApplication;

async function createNestApp(): Promise<NestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      cors: true,
    });

    const configService = app.get(ConfigService);
    const environment = configService.get<string>('NODE_ENV') || 'production';
    const apiPrefix = configService.get<string>('API_PREFIX') || 'api';

    const appEnvironment = Object.values(NodeEnvEnum).includes(
      environment as NodeEnvEnum,
    )
      ? (environment as NodeEnvEnum)
      : NodeEnvEnum.PRODUCTION;

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

    if (appEnvironment !== NodeEnvEnum.PRODUCTION) {
      setupSwagger(app);
    }

    await app.init();
  }
  return app;
}

async function bootstrap(): Promise<void> {
  const nestApp = await createNestApp();
  const configService = nestApp.get(ConfigService);
  const basePort = configService.get<number>('PORT') ?? 3000;
  const environment = configService.get<string>('NODE_ENV') || 'local';

  const appEnvironment = Object.values(NodeEnvEnum).includes(
    environment as NodeEnvEnum,
  )
    ? (environment as NodeEnvEnum)
    : NodeEnvEnum.LOCAL;

  if (appEnvironment === NodeEnvEnum.LOCAL) {
    await handleLocalEnvironment(nestApp, basePort);
  } else {
    await nestApp.listen(basePort);
    console.log(
      `Application is running on port: http://localhost:${basePort} in ${environment} environment`,
    );
    console.log(
      `Swagger documentation: http://localhost:${basePort}/${process.env.SWAGGER_PATH || 'api/docs'}`,
    );
  }
}

// Helper to obtain a safely typed request handler without using any
function getHttpHandler(
  nestApp: NestApplication,
): (req: Request, res: Response, next: NextFunction) => void {
  const adapter = nestApp.getHttpAdapter() as {
    getInstance(): unknown;
  };
  const instanceUnknown: unknown = adapter.getInstance();
  if (typeof instanceUnknown !== 'function') {
    throw new Error('HTTP adapter instance is not a function');
  }
  return instanceUnknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
}

// Export handler for Vercel
export default async (req: Request, res: Response): Promise<void> => {
  const nestApp = await createNestApp();
  const handler = getHttpHandler(nestApp);
  await new Promise<void>((resolve, reject) => {
    const onError = (err: unknown) =>
      reject(err instanceof Error ? err : new Error(String(err)));
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', onError);
    handler(req, res, (err?: unknown) => {
      if (err) {
        onError(err);
      }
    });
  });
};

// Bootstrap for local development
if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
  });
}
