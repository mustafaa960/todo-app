import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/schemas/user.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.dto';
import { UseGuards } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
import { RegisterUserInput } from './dto/register.input';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => User, { name: 'registerUser' })
  async register(@Args("input") input: RegisterUserInput): Promise<User> {
    return this.authService.registerUser(input);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args("input") input: LoginInput,
    @Context() ctx,
  ): Promise<AuthResponse> {
    try {
      return await this.authService.login(ctx.req.user);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Mutation(() => AuthResponse, { name: 'refreshToken' })
  async refreshToken(@Context() ctx): Promise<AuthResponse> {
    return await this.authService.refreshToken(ctx.req.user);
  }

  @Mutation(() => Boolean, { name: 'signOut' })
  async signOut(@Context() context): Promise<boolean> {
    console.log(context.req.user._id);
    await this.authService.signOut(context.req.user._id);
    return true;
  }
}
