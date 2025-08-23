import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseIdPresenter } from 'src/common/base';
import { RoleEnum } from 'src/common/enums';

@Exclude()
export class MePresenter extends BaseIdPresenter {
  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({
    enum: RoleEnum,
    enumName: RoleEnum.USER,
  })
  @Expose()
  role: RoleEnum;
}
