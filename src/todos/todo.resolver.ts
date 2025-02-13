import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTodoInput } from './input/create-todo.input';
import { TodoService } from './todo.service';
import { Todo } from './schemas/todo.schema';
import { UpdateTodoInput } from './input/update-todo.input';
import { PaginatedResponse } from 'src/common/dto/pagination.dto';
import { FindTodosArgs } from './args/todos.args';

const PaginatedTodoResponse = PaginatedResponse(Todo);
@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query(() => PaginatedTodoResponse, { name: 'todos' })
  async findAll(
    @Args() filters: FindTodosArgs,
  ): Promise<typeof PaginatedTodoResponse> {
    return this.todoService.findAll(filters);
  }

  @Query(() => Todo, { name: 'todo', nullable: true })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.todoService.findOne(id);
  }

  @Mutation(() => Todo)
  async createTodo(@Args('input') input: CreateTodoInput) {
    return this.todoService.create(input);
  }

  @Mutation(() => Todo)
  async updateTodo(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateTodoInput,
  ): Promise<Todo> {
    return this.todoService.update(id, input);
  }

  @Mutation(() => Todo, { name: 'deleteTodo' })
  async deleteTodo(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Todo> {
    return this.todoService.delete(id);
  }
}
