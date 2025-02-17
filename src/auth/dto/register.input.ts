import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { LoginInput } from './login.input';
import { IsOptional } from 'class-validator';

@InputType()
export class RegisterUserInput extends LoginInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  fullName?: string;
}
