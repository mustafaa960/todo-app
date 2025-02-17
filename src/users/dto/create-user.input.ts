import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { RegisterUserInput } from 'src/auth/dto/register.input';
import { IsMongoId } from 'class-validator';

@InputType()
export class CreateUserWithRoleInput extends RegisterUserInput {
  @Field(() => String, { nullable: false, description: 'Role ID for the user' })
  @IsMongoId({ message: 'Invalid roleId format' })
  roleId: string;
}
