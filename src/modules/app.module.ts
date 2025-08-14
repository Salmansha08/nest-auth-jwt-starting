import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'src/common/config/database.config';
import { HealthModule } from 'src/modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
