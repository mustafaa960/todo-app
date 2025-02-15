import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TodoStatus } from '../enums/todo-status.enum';
import { OffsetPaginationArgs } from 'src/common/args/pagination.args';

@ArgsType()
export class FindTodosArgs extends OffsetPaginationArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => TodoStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TodoStatus, {
    message: 'Status must be PENDING, IN_PROGRESS, or DONE',
  })
  status?: TodoStatus;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  createdFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  createdTo?: Date;
}
