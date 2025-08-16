import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BasePresenter {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

@Exclude()
export class BaseIdPresenter {
  @ApiProperty()
  @Expose()
  id: string;
}

@Exclude()
export class MetaPresenter {
  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  limit: number;

  @ApiProperty()
  @Expose()
  totalItems: number;

  @ApiProperty()
  @Expose()
  totalPages: number;
}

@Exclude()
export class PaginationPresenter<T> {
  @ApiProperty()
  @Expose()
  entities: T[];

  @ApiProperty()
  @Expose()
  meta: MetaPresenter;
}
