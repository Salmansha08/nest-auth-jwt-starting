import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseIdPresenter } from 'src/common/base';
import { RoleEnum } from 'src/common/enums';

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
}
