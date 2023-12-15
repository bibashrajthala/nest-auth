import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    type: 'number',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: 'number', example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset?: number;
}
