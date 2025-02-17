import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';

@Schema({ _id: false })
@ObjectType()
export class Permission {
  @Prop({ required: true, enum: Resource })
  @Field(() => Resource)
  resource: Resource;

  @Prop({ type: [{ type: String, enum: Action }] })
  @Field(() => [Action])
  actions: Action[];
}
export type PermissionDocument = Permission & Document;
export const PermissionSchema = SchemaFactory.createForClass(Permission);

@Schema()
@ObjectType()
export class Role {
  @Field(() => String)
  _id: string;

  @Prop({ required: true ,unique: true})
  @Field(() => String)
  name: string;

  @Prop({ required: true, type: [PermissionSchema] })
  @Field(() => [Permission])
  permissions: Permission[];
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
