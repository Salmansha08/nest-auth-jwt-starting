import { registerAs } from '@nestjs/config';
import { AppConfig } from '../interfaces';

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
    corsEnabled: process.env.CORS_ENABLED === 'true',
  }),
);
