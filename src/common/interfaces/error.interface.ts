import { HttpStatus } from '@nestjs/common';

export interface IErrorObject {
  message: string;
  description?: string;
  statusCode?: HttpStatus;
}
