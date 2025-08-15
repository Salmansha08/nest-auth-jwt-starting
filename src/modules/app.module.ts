import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  validateEnvironment,
} from 'src/common/config';
import { HealthModule } from 'src/modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
