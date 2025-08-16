import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserPresenter } from 'src/modules/user/presenter';

@Exclude()
export class LoginPresenter {
  @ApiProperty()
  @Expose()
  user: UserPresenter;

  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  expiresIn: string;
}
