import { HttpException, HttpStatus } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { MetaPresenter } from './base.presenter';
import { SuccessResponse } from '../interfaces';

export class BaseController {
  /**
   * Transform a single object to a DTO class
   */
  protected transformObject<T>(
    type: new () => T,
    data: Partial<T>,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(type, data, options);
  }

  /**
   * Transform an array of objects to DTO classes
   */
  protected transformArray<T>(
    type: new () => T,
    data: Partial<T>[],
    options?: ClassTransformOptions,
  ): T[] {
    return plainToInstance(type, data, options);
  }

  /**
   * Create a success response
   */
  private createSuccessResponse<T>(
    data: T,
    message: string,
    statusCode: number,
    meta?: MetaPresenter,
  ): SuccessResponse<T> {
    return {
      data,
      message,
      statusCode,
      meta,
    };
  }

  protected findSuccess<T>(
    data: T,
    message = 'Found Successfully',
    meta?: MetaPresenter,
  ): SuccessResponse<T> {
    return this.createSuccessResponse(data, message, HttpStatus.OK, meta);
  }

  protected createSuccess(
    message = 'Created Successfully',
  ): SuccessResponse<null> {
    return this.createSuccessResponse(null, message, HttpStatus.CREATED);
  }

  protected updateSuccess<T>(
    data: T,
    message = 'Updated Successfully',
  ): SuccessResponse<T> {
    return this.createSuccessResponse(data, message, HttpStatus.OK);
  }

  protected deleteSuccess(
    message = 'Deleted Successfully',
  ): SuccessResponse<null> {
    return this.createSuccessResponse(null, message, HttpStatus.NO_CONTENT);
  }

  /**
   * Create an error response
   */
  private throwError(
    message: string,
    statusCode: HttpStatus,
    data?: unknown,
  ): never {
    throw new HttpException(
      {
        message,
        statusCode,
        data,
      },
      statusCode,
    );
  }

  // Error-specific methods now throw the custom exception
  protected notFound(message = 'Not Found', data?: unknown): never {
    this.throwError(message, HttpStatus.NOT_FOUND, data);
  }

  protected internalServerError(
    message = 'Internal Server Error',
    data?: unknown,
  ): never {
    this.throwError(message, HttpStatus.INTERNAL_SERVER_ERROR, data);
  }

  protected badRequest(message = 'Bad Request', data?: unknown): never {
    this.throwError(message, HttpStatus.BAD_REQUEST, data);
  }

  protected unauthorized(message = 'Unauthorized', data?: unknown): never {
    this.throwError(message, HttpStatus.UNAUTHORIZED, data);
  }

  protected forbidden(message = 'Forbidden', data?: unknown): never {
    this.throwError(message, HttpStatus.FORBIDDEN, data);
  }
}
