import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { PaginatedTodo, Todo } from './schemas/todo.schema';
import { FindTodosArgs } from './dto/todos.args';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';

@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query(() => PaginatedTodo, { name: 'todos' })
  async findAll(@Args() filters: FindTodosArgs): Promise<PaginatedTodo> {
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

