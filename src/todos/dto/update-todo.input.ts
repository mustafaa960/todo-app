import { InputType, PartialType } from '@nestjs/graphql';
import { CreateAnyTodoInput, CreateOwnTodoInput } from './create-todo.input';

@InputType()
export class UpdateOwnTodoInput extends PartialType(CreateOwnTodoInput) {}
@InputType()
export class UpdateAnyTodoInput extends PartialType(CreateAnyTodoInput) {}

