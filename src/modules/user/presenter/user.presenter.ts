import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseIdPresenter } from '../../../common/base';
import { GenderEnum, RoleEnum } from 'src/common/enums';

@Exclude()
export class UserPresenter extends BaseIdPresenter {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ enum: RoleEnum, enumName: 'RoleEnum' })
  @Expose()
  role: RoleEnum;

  @ApiPropertyOptional({ enum: GenderEnum, enumName: 'GenderEnum' })
  @Expose()
  gender?: GenderEnum;

  @ApiPropertyOptional()
  @Expose()
  age?: number;

  @ApiPropertyOptional()
  @Expose()
  bio?: string;

  @ApiPropertyOptional()
  @Expose()
  photo?: string;
}
