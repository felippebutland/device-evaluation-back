import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
  IsUrl,
  IsEmail
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV?: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT?: number;

  @IsString()
  MONGODB_URI?: string;

  @IsString()
  JWT_SECRET?: string;

  @IsNumber()
  @Min(300) // 5 minutos mínimo
  JWT_EXPIRES_IN?: number;

  @IsString()
  EMAIL_HOST?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  EMAIL_PORT?: number;

  @IsEmail()
  EMAIL_USER?: string;

  @IsString()
  EMAIL_PASSWORD?: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}
