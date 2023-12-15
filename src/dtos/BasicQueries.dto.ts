import { PartialType } from '@nestjs/swagger';
import { PaginatedFilteredSortedQuery } from './Sort.dto';

export class BasicQueryDto extends PartialType(PaginatedFilteredSortedQuery) {}
