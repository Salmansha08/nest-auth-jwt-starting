import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePhotoDto {
  @ApiPropertyOptional({
    description: 'User Profile Photo',
  })
  @IsOptional()
  @IsString()
  photo?: string;
}
