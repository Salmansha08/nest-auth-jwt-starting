import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from '../../user/dto';

export class RegisterDto extends OmitType(CreateUserDto, ['role']) {
  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(24)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  confirmPassword: string;
}
