import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Prop({ required: true, unique: true })
  @Field(() => String)
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  fullName?: string;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
  @Field(() => String)
  roleId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
