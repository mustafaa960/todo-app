import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { UsersModule } from 'src/users/user.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    UsersModule,
    PubSubModule,
  ],
  providers: [TodoResolver, TodoService],
})
export class TodoModule {}

