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

export interface ResponseMetadata {
  statusCode: number;
  message: string;
  timestamp: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationData<T> {
  entities: T[];
  meta: PaginationMeta;
}

export interface IResponse<T> {
  message?: string;
  data?: T;
  statusCode?: number;
}

export interface StandardResponse<T> extends ResponseMetadata {
  data: T;
}
