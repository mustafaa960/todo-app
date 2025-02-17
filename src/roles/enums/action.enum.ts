import { registerEnumType } from "@nestjs/graphql";

export enum Action {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

registerEnumType(Action, {
  name: 'Action'
});
