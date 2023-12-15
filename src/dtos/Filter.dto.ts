import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './Pagination.dto';

export class FilterQueryDto {
  @ApiPropertyOptional({ type: 'string', example: 'Inventory Item' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginatedFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ type: 'string', example: 'Inventory Item' })
  @IsString()
  @IsOptional()
  search?: string;
}
