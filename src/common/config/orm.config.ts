import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();
export const appDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST') ?? 'localhost',
  port: Number(configService.get('DATABASE_PORT') ?? 5432),
  username: configService.get('DATABASE_USERNAME') ?? 'postgres',
  password: configService.get('DATABASE_PASSWORD') ?? 'password',
  database: configService.get('DATABASE_NAME') ?? 'postgres',
  schema: configService.get('DATABASE_SCHEMA') ?? 'public',
  synchronize: true,
  logging: (configService.get('DATABASE_LOGGING') ?? 'false') === 'true',
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
});
