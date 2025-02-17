import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { TodoStatus } from '../enums/todo-status.enum';

@InputType()
export class CreateOwnTodoInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TodoStatus, {
    description: 'Status must be TODO PENDING, IN_PROGRESS, or DONE',
  })
  @IsEnum(TodoStatus, {
    message: 'Status must be TODO PENDING, IN_PROGRESS, or DONE',
  })
  status: TodoStatus;
}
@InputType()
export class CreateAnyTodoInput extends CreateOwnTodoInput {
  @Field(() => String, { nullable: true, description: 'Role ID for the user' })
  @IsMongoId({ message: 'Invalid userId format' })
  @IsOptional()
  userId?: string;
}

