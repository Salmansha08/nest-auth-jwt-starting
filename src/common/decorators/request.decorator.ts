import { Type, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ResponseEnum } from '../enums';
import { ApiObjectResponse } from './object-response.decorator';
import { PaginationInterceptor, TransformInterceptor } from '../interceptors';
import { ApiArrayResponse } from './array-response.decorator';
import { ApiPaginationResponse } from './pagination-response.decorator';

export const ApiDoc = (
  options: {
    summary: string;
    description?: string;
    status?: number;
    responseType: ResponseEnum;
  },
  dataDto?: Type<unknown>,
) => {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description || options.summary,
    }),
  ];

  switch (options.responseType) {
    case ResponseEnum.OBJECT:
      decorators.push(
        ApiObjectResponse(
          { status: options.status, description: options.description },
          dataDto || Object,
        ),
        UseInterceptors(new TransformInterceptor()),
      );
      break;
    case ResponseEnum.ARRAY:
      decorators.push(
        ApiArrayResponse(
          { status: options.status, description: options.description },
          dataDto || Object,
        ),
        UseInterceptors(new TransformInterceptor()),
      );
      break;
    case ResponseEnum.PAGINATION:
      decorators.push(
        ApiPaginationResponse(
          { status: options.status, description: options.description },
          dataDto || Object,
        ),
        UseInterceptors(new PaginationInterceptor()),
      );
      break;
  }

  return applyDecorators(...decorators);
};
