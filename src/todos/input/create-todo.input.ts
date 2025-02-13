import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TodoStatus } from '../enums/todo-status.enum';

@InputType()
export class CreateTodoInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TodoStatus, {
    description: 'Status must be PENDING, IN_PROGRESS, or DONE',
  })
  @IsEnum(TodoStatus, {
    message: 'Status must be PENDING, IN_PROGRESS, or DONE',
  })
  status: TodoStatus;
}
