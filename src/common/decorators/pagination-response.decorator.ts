import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiPaginationResponse = <DataDto extends Type<unknown>>(
  options: ApiResponseOptions,
  dataDto: DataDto,
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
            properties: {
              entities: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
              meta: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                  },
                  offset: {
                    type: 'number',
                  },
                  itemCount: {
                    type: 'number',
                  },
                  pageCount: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
    }),
  );
