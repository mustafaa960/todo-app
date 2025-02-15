import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';

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
  refreshToken?: string; // ✅ Added refreshToken field
}

export const UserSchema = SchemaFactory.createForClass(User);
