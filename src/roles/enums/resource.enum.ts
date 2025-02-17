import { registerEnumType } from '@nestjs/graphql';

export enum Resource {
  TODOS = 'TODOS',
  USERS = 'USERS',
  ROLES = 'ROLES',
}

registerEnumType(Resource, {
  name: 'Resource',
});
