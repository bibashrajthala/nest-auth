import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserColumn } from '../types/user.types';
import { IsEnum, IsOptional } from 'class-validator';
import { BasicQueryDto } from '../../../dtos/BasicQueries.dto';

export class ListUsersQueryDto extends BasicQueryDto {
  @ApiPropertyOptional({
    description: 'The column to order the result by',
    type: 'enum',
    enum: UserColumn,
    example: UserColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserColumn)
  orderBy?: UserColumn;
}
