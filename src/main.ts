import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from 'src/modules/app.module';
import { NodeEnvEnum } from 'src/common/enums';
import { handleLocalEnvironment } from 'src/common/utils';

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);
  const basePort = configService.get<number>('PORT') ?? 3000;

  const environment = configService.get<string>('NODE_ENV') || '';
  const appEnvironment = Object.values(NodeEnvEnum).includes(
    environment as NodeEnvEnum,
  )
    ? (environment as NodeEnvEnum)
    : NodeEnvEnum.LOCAL;

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
