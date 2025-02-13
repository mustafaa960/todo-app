import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IOffsetPaginatedType<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function Paginated<T>(classRef: Type<T>): Type<IOffsetPaginatedType<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IOffsetPaginatedType<T> {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    offset: number;

    @Field(() => Int)
    limit: number;

    @Field()
    hasNextPage: boolean;

    @Field()
    hasPreviousPage: boolean;
  }
  return PaginatedType as Type<IOffsetPaginatedType<T>>;
}
