import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsEnum,
  ArrayUnique,
  ValidateNested,
} from 'class-validator';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';
import { Type } from 'class-transformer';

@InputType()
export class CreateRoleInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => [PermissionInput])
  @ValidateNested({ each: true })
  @Type(() => PermissionInput)
  permissions: PermissionInput[];
}

@InputType()
export class PermissionInput {
  @Field(() => Resource)
  @IsEnum(Resource)
  resource: Resource;

  @Field(() => [Action])
  @IsEnum(Action, { each: true })
  @ArrayUnique()
  actions: Action[];
}
