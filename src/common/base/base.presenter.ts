import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Array of entities',
    type: 'array',
  })
  @Expose()
  entities: T[];

  @ApiPropertyOptional({
    description: 'Pagination meta data (null if pagination is disabled)',
    type: MetaPresenter,
    nullable: true,
  })
  @Expose()
  meta: MetaPresenter | null;
}
