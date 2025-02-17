import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionInput } from 'src/roles/dto/create-role.input';
import { RolesService } from 'src/roles/roles.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions: PermissionInput[] =
      this.reflector.getAllAndOverride<PermissionInput[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const req = this.getRequest(context);
    const user: UserDocument = req.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const role = await this.roleService.findById(user.roleId.toString());
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    const hasAllPermissions = requiredPermissions.every((requiredPerm) =>
      role.permissions.some(
        (userPerm) =>
          userPerm.resource === requiredPerm.resource &&
          requiredPerm.actions.every((action) =>
            userPerm.actions.includes(action),
          ),
      ),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    return GqlExecutionContext.create(context).getContext().req;
  }
}
