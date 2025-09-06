import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import {
  appConfig,
  databaseConfig,
  multerConfig,
  validateEnvironment,
} from 'src/common/config';
import { DatabaseConfig } from '../common/interfaces';
import { HealthModule } from './health/health.module';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        return {
          type: 'postgres' as const,
          ...dbConfig,
        };
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 10 }],
    }),
    MulterModule.register({
      storage: multerConfig.storage,
      fileFilter: multerConfig.fileFilter,
    }),
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [MulterModule],
})
export class AppModule {}
