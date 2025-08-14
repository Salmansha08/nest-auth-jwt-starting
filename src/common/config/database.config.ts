import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from 'src/common/interfaces';

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '54321', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_DB || 'app_db',
    schema: process.env.DATABASE_SCHEMA || 'public',
    logging: process.env.DATABASE_LOGGING === 'true',
    synchronize: false,
  }),
);
