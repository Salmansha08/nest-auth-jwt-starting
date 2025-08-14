import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

const configService = new ConfigService();
export const appDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
  username: configService.get('DATABASE_USERNAME') || 'postgres',
  password: configService.get('DATABASE_PASSWORD') || 'postgres',
  database: configService.get('DATABASE_DB') || 'postgres',
  schema: configService.get('DATABASE_SCHEMA') || 'public',
  logging: configService.get('DATABASE_LOGGING') || true,
  entities: [__dirname + 'src/modules/**/**/*.entity{.ts,.js}'],
  migrations: [__dirname + 'src/database/migrations/*{.ts,.js}'],
});
