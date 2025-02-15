import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { LoginInput } from 'src/auth/dto/login.input';

@ArgsType()
export class CreateUserInput extends LoginInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  fullName?: string;
}
