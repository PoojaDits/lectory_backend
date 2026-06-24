import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Lectory Auth API')
  .setDescription('Single /api/auth/register with role: customer | seller')
  .setVersion('1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'access-token',
  )
  // Ensures Swagger UI sends the Authorization header with protected APIs.
  .addSecurityRequirements('access-token')
  .build();