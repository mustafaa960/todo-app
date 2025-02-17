import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserWithRoleInput } from './dto/create-user.input';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Resource } from 'src/roles/enums/resource.enum';
import { Action } from 'src/roles/enums/action.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateOwnUserInput, UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'profile' })
  async profile(@CurrentUser() user: User): Promise<User> {
    return user;
  }
  @Permissions([{ resource: Resource.USERS, actions: [Action.CREATE] }])
  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args("input") input: CreateUserWithRoleInput): Promise<User> {
    return this.userService.create(input);
  }
  @Mutation(() => User, { name: 'updateOwnUser' })
  async updateOwnUser(
    @CurrentUser() user: User,
    @Args("input") input: UpdateOwnUserInput,
  ): Promise<User> {
    return this.userService.updateOwnUser(user._id, input);
  }

  @Permissions([{ resource: Resource.USERS, actions: [Action.UPDATE] }])
  @Mutation(() => User, { name: 'updateAnyUser' })
  async updateAnyUser(
    @Args('userId') userId: string,
    @Args("input") input: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateAnyUser(userId, input);
  }

  @Permissions([{ resource: Resource.USERS, actions: [Action.READ] }])
  @Query(() => User, { name: 'user', nullable: true })
  async findUserById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User> {
    return this.userService.findById(id);
  }
  @Permissions([{ resource: Resource.USERS, actions: [Action.READ] }])
  @Query(() => User, { name: 'userByUsername', nullable: true })
  async findUserByUsername(
    @Args('username', { type: () => String }) username: string,
  ): Promise<User> {
    return this.userService.findByUsername(username);
  }
  @Permissions([{ resource: Resource.USERS, actions: [Action.READ] }])
  @Query(() => [User], { name: 'users' })
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
}
