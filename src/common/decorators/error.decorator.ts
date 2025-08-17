import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { IErrorObject } from '../interfaces';

export function ApiErrorDecorator(
  args: IErrorObject[] | IErrorObject,
  options?: ApiResponseOptions,
) {
  let schema: Record<string, any>, statusCode: number, description: string;
  if (Array.isArray(args)) {
    statusCode = args[0].statusCode ?? 500;
    description = args.map((item) => item.description).join(', ');

    const anyOf = args.map((item) => ({
      properties: {
        message: {
          type: 'string',
          default: item.message,
        },
        status_code: {
          type: 'number',
          default: item.statusCode,
        },
        date: {
          type: 'date',
          default: new Date(),
        },
      },
    }));

    schema = {
      anyOf,
    };
  } else {
    statusCode = args.statusCode ?? 500;
    description = args.description ?? 'No description provided';

    schema = {
      properties: {
        message: {
          type: 'string',
          default: args.message,
        },
        status_code: {
          type: 'number',
          default: args.statusCode,
        },
        date: {
          type: 'date',
          default: new Date(),
        },
      },
    };
  }

  return applyDecorators(
    ApiResponse({
      ...options,
      status: statusCode,
      description: description,
      schema,
    }),
  );
}
