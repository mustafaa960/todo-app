import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateTodoInput } from './input/create-todo.input';
import { UpdateTodoInput } from './input/update-todo.input';
import { FindTodosArgs } from './args/todos.args';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async create(createTodoInput: CreateTodoInput): Promise<Todo> {
    const createdTodo = new this.todoModel(createTodoInput);
    return createdTodo.save();
  }

  async update(id: string, updateTodoInput: UpdateTodoInput): Promise<Todo> {
    const existingTodo = await this.findOne(id);
    Object.assign(existingTodo, updateTodoInput);
    return existingTodo.save();
  }

  async findAll(filters: FindTodosArgs) {
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
    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 10;
    const total = await this.todoModel.countDocuments(query);
    const items = await this.todoModel
      .find(query)
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

  async findOne(id: string) {
    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo not found`);
    }
    return todo;
  }

  async delete(id: string): Promise<Todo> {
    await this.findOne(id);
    return this.todoModel.findByIdAndDelete(id);
  }
}
