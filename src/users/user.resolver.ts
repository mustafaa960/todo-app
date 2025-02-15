import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args() input: CreateUserInput): Promise<User> {
    return this.userService.create(input);
  }

  @Query(() => User, { name: 'user', nullable: true })
  async findUserById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User> {
    return this.userService.findById(id);
  }

  @Query(() => User, { name: 'userByUsername', nullable: true })
  async findUserByUsername(
    @Args('username', { type: () => String }) username: string,
  ): Promise<User> {
    return this.userService.findByUsername(username);
  }
}
