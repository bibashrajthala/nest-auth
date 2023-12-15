import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { SORT_DIRECTION } from 'src/types/sort.types';
import { PaginatedFilterQueryDto } from './Filter.dto';

export class SortQueryDto {
  @ValidateIf((o) => o.orderBy) // validate only when orderBy(ie column) is provided
  @ApiPropertyOptional({
    description: 'The direction to sort the result by',
    type: 'enum',
    enum: SORT_DIRECTION,
    example: SORT_DIRECTION.ASC,
  })
  @IsEnum(SORT_DIRECTION)
  @IsOptional()
  sort?: SORT_DIRECTION;
}

export class PaginatedFilteredSortedQuery extends PaginatedFilterQueryDto {
  @ValidateIf((o) => o.orderBy) // validate only when orderBy(ie column) is provided
  @ApiPropertyOptional({
    description: 'The direction to sort the result by',
    type: 'enum',
    enum: SORT_DIRECTION,
    example: SORT_DIRECTION.ASC,
  })
  @IsEnum(SORT_DIRECTION)
  @IsOptional()
  sort?: SORT_DIRECTION;
}
