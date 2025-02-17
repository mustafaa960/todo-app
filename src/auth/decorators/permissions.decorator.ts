import { SetMetadata } from '@nestjs/common';
import { PermissionInput } from 'src/roles/dto/create-role.input';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (permissions: PermissionInput[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
