import { plainToClass, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { NodeEnvEnum } from '../enums';

class EnvironmentVariables {
  @IsEnum(NodeEnvEnum)
  NODE_ENV: NodeEnvEnum;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  PORT: number;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  APP_NAME: string;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
