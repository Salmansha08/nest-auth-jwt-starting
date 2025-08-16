import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiArrayResponse = <DataDto extends Type<unknown>>(
  options: ApiResponseOptions,
  dataDto: DataDto,
  isPrimitive?: boolean,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiResponse({
      ...options,
      status: options.status,
      description: options.description,
      schema: {
        properties: {
          message: {
            type: 'string',
            default: options.description,
          },
          statusCode: {
            type: 'number',
            default: options.status,
          },
          date: {
            type: 'string',
            default: new Date().toISOString(),
          },
          total: {
            type: 'number',
            default: 0,
          },
          data: {
            type: 'array',
            items: isPrimitive
              ? {
                  type: 'string',
                }
              : { $ref: getSchemaPath(dataDto) },
          },
        },
      },
    }),
  );
