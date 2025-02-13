import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { TodoStatus } from '../enums/todo-status.enum';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Todo {
  @Field(() => String)
  _id: string;

  @Prop({ required: true })
  @Field(() => String)
  title: string;

  @Prop()
  @Field(() => String, { nullable: true })
  description?: string;

  @Prop({ required: true, enum: TodoStatus, default: TodoStatus.PENDING })
  @Field(() => TodoStatus)
  status: TodoStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
