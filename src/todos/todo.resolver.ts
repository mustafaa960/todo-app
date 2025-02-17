import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { PaginatedTodo, Todo } from './schemas/todo.schema';
import { FindTodosArgs } from './dto/todos.args';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Resource } from 'src/roles/enums/resource.enum';
import { Action } from 'src/roles/enums/action.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import {
  CreateOwnTodoInput,
  CreateAnyTodoInput,
} from './dto/create-todo.input';
import {
  UpdateOwnTodoInput,
  UpdateAnyTodoInput,
} from './dto/update-todo.input';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { Public } from 'src/auth/decorators/public.decorator';
import { Inject, UseGuards } from '@nestjs/common';
import { WebSocketAuthGuard } from 'src/auth/guards/websocket-auth.guard';
// const pubSub = new PubSub();
@Resolver(() => Todo)
export class TodoResolver {
  constructor(
    private readonly todoService: TodoService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  @Public()
  @UseGuards(WebSocketAuthGuard)
  @Subscription(() => Todo, {
    name: 'todoCreated',
    filter: (payload, variables, context) => {
      if (!context.user) return false;
      if (!payload.todoCreated || !payload.todoCreated.user) return false;

      return (
        payload.todoCreated.user._id.toString() === context.user._id.toString()
      );
    },
  })
  todoCreated() {
    return this.pubSub.asyncIterableIterator('todoCreated');
  }

  @Public()
  @UseGuards(WebSocketAuthGuard)
  @Subscription(() => Todo, {
    name: 'todoUpdated',
    filter: (payload, variables, context) => {
      if (!context.user) {
        return false;
      }

      if (!payload.todoUpdated) {
        return false;
      }

      return (
        payload.todoUpdated.user._id.toString() === context.user._id.toString()
      );
    },
  })
  todoUpdated() {
    return this.pubSub.asyncIterableIterator('todoUpdated');
  }

  @Permissions([
    { resource: Resource.USERS, actions: [Action.READ] },
    { resource: Resource.TODOS, actions: [Action.READ] },
  ])
  @Query(() => PaginatedTodo, { name: 'todos' })
  async findAll(@Args() filters: FindTodosArgs): Promise<PaginatedTodo> {
    return this.todoService.findAll(filters);
  }

  @Permissions([{ resource: Resource.TODOS, actions: [Action.READ] }])
  @Query(() => PaginatedTodo, { name: 'myTodos' })
  async myTodos(
    @Args() filters: FindTodosArgs,
    @CurrentUser() user: User,
  ): Promise<PaginatedTodo> {
    return this.todoService.findOwnTodos(filters, user);
  }

  @Permissions([
    { resource: Resource.TODOS, actions: [Action.READ] },
    { resource: Resource.USERS, actions: [Action.READ] },
  ])
  @Query(() => Todo, { name: 'findAnyTodo', nullable: true })
  async findAnyTodo(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.findAnyTodo(id);
  }
  @Permissions([{ resource: Resource.TODOS, actions: [Action.READ] }])
  @Query(() => Todo, { name: 'findMyTodo', nullable: true })
  async findMyTodo(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.findOwnTodo(id, user);
  }

  @Permissions([{ resource: Resource.TODOS, actions: [Action.CREATE] }])
  @Mutation(() => Todo)
  async createOwnTodo(
    @Args('input') input: CreateOwnTodoInput,
    @CurrentUser() user: User,
  ) {
    return this.todoService.createOwn(input, user);
  }

  @Permissions([
    { resource: Resource.TODOS, actions: [Action.CREATE] },
    { resource: Resource.USERS, actions: [Action.UPDATE] },
  ])
  @Mutation(() => Todo)
  async createAnyTodo(@Args('input') input: CreateAnyTodoInput) {
    return this.todoService.createAny(input);
  }

  @Permissions([
    { resource: Resource.TODOS, actions: [Action.UPDATE] },
    { resource: Resource.USERS, actions: [Action.UPDATE] },
  ])
  @Mutation(() => Todo)
  async updateAnyTodo(
    @Args('id') id: string,
    @Args('input') input: UpdateAnyTodoInput,
  ) {
    return this.todoService.updateAnyTodo(id, input);
  }
  @Permissions([{ resource: Resource.TODOS, actions: [Action.UPDATE] }])
  @Mutation(() => Todo)
  async updateOwnTodo(
    @Args('id') id: string,
    @Args('input') input: UpdateOwnTodoInput,
    @CurrentUser() user: User,
  ) {
    return this.todoService.updateOwnTodo(id, input, user);
  }
  @Permissions([{ resource: Resource.TODOS, actions: [Action.DELETE] }])
  @Mutation(() => Todo)
  async deleteOwnTodo(@Args('id') id: string, @CurrentUser() user: User) {
    return this.todoService.deleteOwn(id, user);
  }

  @Permissions([
    { resource: Resource.TODOS, actions: [Action.DELETE] },
    { resource: Resource.USERS, actions: [Action.UPDATE] },
  ])
  @Mutation(() => Todo)
  async deleteAnyTodo(@Args('id') id: string, @CurrentUser() user: User) {
    return this.todoService.deleteAny(id);
  }
}

