import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BasePaginatedResponse {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  offset: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

export function PaginatedResponse<T>(classRef: T): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType extends BasePaginatedResponse {
    @Field(() => [classRef])
    items: T[];
  }
  return PaginatedType;
}
