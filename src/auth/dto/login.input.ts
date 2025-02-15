import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@ArgsType()
export class LoginInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  password: string;
}
