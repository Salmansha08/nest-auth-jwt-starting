import { ConfigService, registerAs } from '@nestjs/config';
import { DatabaseConfig } from '../interfaces';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();
export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    host: configService.get('DATABASE_HOST') ?? 'localhost',
    port: Number(configService.get('DATABASE_PORT') ?? 5432),
    username: configService.get('DATABASE_USERNAME') ?? 'postgres',
    password: configService.get('DATABASE_PASSWORD') ?? 'password',
    database: configService.get('DATABASE_NAME') ?? 'postgres',
    schema: configService.get('DATABASE_SCHEMA') ?? 'public',
    logging: (configService.get('DATABASE_LOGGING') ?? 'false') === 'true',
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
    synchronize: false, // Disable synchronize to prevent conflicts
  }),
);
