import { registerEnumType } from '@nestjs/graphql';

export enum TodoStatus {
  TODO = 'TODO',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

registerEnumType(TodoStatus, {
  name: 'TodoStatus',
  description: 'Status of a Todo item',
});
