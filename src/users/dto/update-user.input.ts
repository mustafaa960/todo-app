import { ArgsType, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateUserWithRoleInput } from './create-user.input';
import { RegisterUserInput } from 'src/auth/dto/register.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserWithRoleInput) {}

@InputType()
export class UpdateOwnUserInput extends OmitType(PartialType(
  RegisterUserInput), ['username'],
) {}
