import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedTodo, Todo, TodoDocument } from './schemas/todo.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { FindTodosArgs } from './dto/todos.args';
import { User } from 'src/users/schemas/user.schema';
import {
  CreateAnyTodoInput,
  CreateOwnTodoInput,
} from './dto/create-todo.input';
import {
  UpdateAnyTodoInput,
  UpdateOwnTodoInput,
} from './dto/update-todo.input';
import { UserService } from 'src/users/user.service';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async createOwn(input: CreateOwnTodoInput, user: User): Promise<Todo> {
    const todo = new this.todoModel({
      ...input,
      user: new Types.ObjectId(user._id),
    });

    await todo.save();

    return this.todoModel.findById(todo._id).populate('user').exec();
  }

  async createAny(input: CreateAnyTodoInput): Promise<Todo> {
    let user: User | null = null;

    if (input.userId) {
      user = await this.userService.findById(input.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const todo = new this.todoModel({
      ...input,
      user: user ? new Types.ObjectId(user._id) : null,
    });

    await todo.save();

    if (todo.user) {
      const populatedTodo = await this.todoModel
        .findById(todo._id)
        .populate('user')
        .exec();
      await this.pubSub.publish(`todoCreated`, {
        todoCreated: populatedTodo,
      });
    }

    return this.todoModel.findById(todo._id).populate('user').exec();
  }

  async findAll(filters: FindTodosArgs): Promise<PaginatedTodo> {
    const query: FilterQuery<TodoDocument> = this.buildFilterQuery(filters);

    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 10;
    const total = await this.todoModel.countDocuments(query);
    const items = await this.todoModel
      .find(query)
      .populate('user')
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      items,
      total,
      offset,
      limit,
      hasNextPage: offset + limit < total,
      hasPreviousPage: offset > 0,
    };
  }

  async findOwnTodos(
    filters: FindTodosArgs,
    user: User,
  ): Promise<PaginatedTodo> {
    const query: FilterQuery<TodoDocument> = {
      ...this.buildFilterQuery(filters),
      user: user._id,
    };

    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 10;
    const total = await this.todoModel.countDocuments(query);
    const items = await this.todoModel
      .find(query)
      .populate('user')
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      items,
      total,
      offset,
      limit,
      hasNextPage: offset + limit < total,
      hasPreviousPage: offset > 0,
    };
  }

  async findOwnTodo(id: string, user: User): Promise<TodoDocument> {
    const todo = await this.todoModel.findById(id).populate('user').exec();
    if (!todo) throw new NotFoundException(`Todo not found`);

    if (!todo.user || todo.user._id.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only access your own todos');
    }
    return todo;
  }
  async findAnyTodo(id: string): Promise<TodoDocument> {
    const todo = await this.todoModel.findById(id).populate('user').exec();
    if (!todo) throw new NotFoundException(`Todo not found`);
    return todo;
  }
  async updateAnyTodo(id: string, input: UpdateAnyTodoInput): Promise<Todo> {
    const todo = await this.findAnyTodo(id);

    if (!todo) throw new NotFoundException('Todo not found');

    if (input.userId !== undefined) {
      if (input.userId === null) {
        todo.user = null;
      } else {
        await this.userService.findById(input.userId);
        todo.user = input.userId as any;
      }
    }

    Object.assign(todo, input);
    await todo.save();

    const updatedTodo = await this.todoModel
      .findById(todo._id)
      .populate('user')
      .exec();

    if (updatedTodo.user) {
      await this.pubSub.publish(`todoUpdated`, { todoUpdated: updatedTodo });
    }

    return updatedTodo;
  }

  async updateOwnTodo(
    id: string,
    input: UpdateOwnTodoInput,
    user: User,
  ): Promise<Todo> {
    const todo = await this.findOwnTodo(id, user);

    Object.assign(todo, input);
    return todo.save();
  }

  async deleteOwn(id: string, user: User): Promise<Todo> {
    const todo = await this.findOwnTodo(id, user);
    const deletedTodo = await this.todoModel
      .findByIdAndDelete(todo._id)
      .populate('user')
      .exec();

    if (!deletedTodo.user) {
      deletedTodo.user = null;
    }

    return deletedTodo;
  }

  async deleteAny(id: string): Promise<Todo> {
    const todo = await this.findAnyTodo(id);
    const deletedTodo = await this.todoModel
      .findByIdAndDelete(todo._id)
      .populate('user')
      .exec();

    if (!deletedTodo.user) {
      deletedTodo.user = null;
    }

    return deletedTodo;
  }

  private buildFilterQuery(filters: FindTodosArgs): FilterQuery<TodoDocument> {
    const query: FilterQuery<TodoDocument> = {};

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.createdFrom || filters.createdTo) {
      query.createdAt = {};
      if (filters.createdFrom) query.createdAt.$gte = filters.createdFrom;
      if (filters.createdTo) {
        filters.createdTo.setUTCHours(23, 59, 59);
        query.createdAt.$lte = filters.createdTo;
      }
    }

    return query;
  }
}

