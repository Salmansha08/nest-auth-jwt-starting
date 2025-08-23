import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiObjectResponse = <
  DataDto extends Type<unknown> | Type<unknown>[],
>(
  options: ApiResponseOptions,
  dataDtos: DataDto,
) => {
  let dataTypes: Type<unknown>[] | null;
  if (Array.isArray(dataDtos)) {
    dataTypes = dataDtos;
  } else if (dataDtos !== undefined) {
    dataTypes = [dataDtos];
  } else {
    dataTypes = null;
  }

  const schemas =
    dataTypes !== null
      ? dataTypes.map((dataDto) => ({
          $ref: getSchemaPath(dataDto),
        }))
      : null;

  const properties = {
    message: {
      type: 'string',
      default: options.description,
    },
    statusCode: {
      type: 'number',
      default: options.status,
    },
    timestamp: {
      type: 'string',
      default: new Date().toISOString(),
    },
  };

  if (!schemas) {
    return applyDecorators(
      ApiResponse({
        ...options,
        status: options.status,
        description: options.description,
        schema: {
          properties,
        },
      }),
    );
  }

  properties['data'] = {
    oneOf: schemas,
  };
  return applyDecorators(
    ...(dataTypes ? [ApiExtraModels(...dataTypes)] : []),
    ApiResponse({
      ...options,
      status: options.status,
      description: options.description,
      schema: {
        properties,
      },
    }),
  );
};
