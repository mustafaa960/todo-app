import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { Role } from './schemas/role.schema';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Resource } from './enums/resource.enum';
import { Action } from './enums/action.enum';

@Resolver(() => Role)
export class RolesResolver {
  constructor(private readonly roleService: RolesService) {}
  @Permissions([{ resource: Resource.ROLES, actions: [Action.READ] }])
  @Query(() => [Role], { name: 'roles' })
  async getAllRoles(): Promise<Role[]> {
    return this.roleService.findAll();
  }
  @Permissions([{ resource: Resource.ROLES, actions: [Action.READ] }])
  @Query(() => Role, { name: 'role' })
  async getRole(@Args('id', { type: () => String }) id: string): Promise<Role> {
    return this.roleService.findById(id);
  }

  @Permissions([{ resource: Resource.ROLES, actions: [Action.CREATE] }])
  @Mutation(() => Role)
  async createRole(@Args('input') input: CreateRoleInput): Promise<Role> {
    return this.roleService.create(input);
  }

  @Permissions([{ resource: Resource.ROLES, actions: [Action.UPDATE] }])
  @Mutation(() => Role)
  async updateRole(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateRoleInput,
  ): Promise<Role> {
    return this.roleService.update(id, input);
  }

  @Permissions([{ resource: Resource.ROLES, actions: [Action.DELETE] }])
  @Mutation(() => Boolean)
  async deleteRole(
    @Args('id', { type: () => String }) id: string,
  ): Promise<boolean> {
    return this.roleService.delete(id);
  }
}
