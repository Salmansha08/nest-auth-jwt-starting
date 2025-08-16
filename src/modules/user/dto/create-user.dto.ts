import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/common/enums';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'Anonymous',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'anonymous@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Anon123!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(24)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: RoleEnum.USER,
  })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
