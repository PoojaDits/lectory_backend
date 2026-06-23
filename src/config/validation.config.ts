import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true, // CRITICAL for your single /auth/register API
  transform: true,
  transformOptions: { enableImplicitConversion: true },
};

export const globalValidationPipe = () => new ValidationPipe(validationConfig);