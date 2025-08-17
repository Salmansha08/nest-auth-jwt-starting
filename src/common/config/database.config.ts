import { ConfigService, registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DatabaseConfig, DatabaseURLConfig } from '../interfaces';

dotenv.config();

const configService = new ConfigService();
export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig | DatabaseURLConfig => {
    const url = configService.get<string>('DATABASE_URL');
    const logging = configService.get<boolean>('DATABASE_LOGGING') === true;
    const entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
    const migrations = [__dirname + '/../../database/migrations/*{.ts,.js}'];

    if (url) {
      return {
        url,
        autoLoadEntities: true,
        synchronize: false,
        logging,
        entities,
        migrations,
      };
    }

    return {
      host: configService.get('DATABASE_HOST') ?? 'localhost',
      port: Number(configService.get('DATABASE_PORT') ?? 5432),
      username: configService.get('DATABASE_USERNAME') ?? 'postgres',
      password: configService.get('DATABASE_PASSWORD') ?? 'password',
      database: configService.get('DATABASE_NAME') ?? 'postgres',
      schema: configService.get('DATABASE_SCHEMA') ?? 'public',
      logging,
      autoLoadEntities: true,
      synchronize: false,
      entities,
      migrations,
    };
  },
);
