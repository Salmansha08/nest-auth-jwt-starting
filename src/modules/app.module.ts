import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  appConfig,
  databaseConfig,
  validateEnvironment,
} from 'src/common/config';
import { HealthModule } from 'src/modules/health/health.module';
import { UsersModule } from 'src/modules/user/user.module';

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
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get<string>('DATABASE_HOST'),
        port: Number(cs.get('DATABASE_PORT') ?? 5432),
        username: cs.get<string>('DATABASE_USERNAME'),
        password: cs.get<string>('DATABASE_PASSWORD'),
        database: cs.get<string>('DATABASE_DB'),
        schema: cs.get<string>('DATABASE_SCHEMA') ?? 'public',
        logging:
          cs.get('DATABASE_LOGGING') === 'true' ||
          cs.get('DATABASE_LOGGING') === true,
        entities: [__dirname + '/modules/**/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('CACHE_TTL', 60),
        max: configService.get('CACHE_MAX_ITEMS', 100),
      }),
    }),
    HealthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
