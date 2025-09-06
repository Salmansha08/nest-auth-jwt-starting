import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GenderEnum } from '../../../common/enums';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'The gender of the user',
    enum: GenderEnum,
    enumName: 'GenderEnum',
    example: GenderEnum.MALE,
  })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiPropertyOptional({
    description: 'The age of the user',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({
    description: 'A brief bio of the user',
    example: 'Software developer with 5 years of experience',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
