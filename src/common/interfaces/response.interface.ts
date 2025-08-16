import { MetaPresenter } from 'src/common/base';

export interface SuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: MetaPresenter;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  data: null;
}
