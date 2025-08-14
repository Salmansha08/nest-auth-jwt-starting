import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

const swaggerPath = process.env.SWAGGER_PATH || 'api/docs';

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();

  const swaggerOptions = {
    filter: true,
  };

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.NORD_DARK),
  });
};
