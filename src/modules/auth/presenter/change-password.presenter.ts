import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserPresenter } from '../../user/presenter';

@Exclude()
export class ChangePasswordPresenter extends UserPresenter {
  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
