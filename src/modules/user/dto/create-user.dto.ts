import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    example: 'User',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

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
  password: string;

  @ApiPropertyOptional({
    description: 'The role of the user',
    enum: RoleEnum,
    enumName: 'RoleEnum',
    example: RoleEnum.USER,
  })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role?: RoleEnum;
}
