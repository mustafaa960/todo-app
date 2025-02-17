import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
import { User } from '../users/schemas/user.schema';
import { AuthResponse } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { RegisterUserInput } from './dto/register.input';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(input: RegisterUserInput): Promise<User> {
    return this.userService.register(input);
  }

  async validateLocalUser(
    username: string,
    password: string,
  ): Promise<Partial<User>> {
    const user = await this.userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  private async generateTokens(user: User): Promise<AuthResponse> {
    const payload: AuthJwtPayload = { sub: user._id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_AT_EXPIRES'),
        secret: this.configService.get<string>('JWT_AT_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_RT_EXPIRES'),
        secret: this.configService.get<string>('JWT_RT_SECRET'),
      }),
    ]);

    await this.userService.updateHashedRefreshToken(user._id, refreshToken);

    return { accessToken, refreshToken };
  }

  async login(user: User): Promise<AuthResponse> {
    return await this.generateTokens(user);
  }

  async validateJwtUser(userId: string): Promise<Partial<User>> {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or signed out');
    }
    const { password: _, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) return false;
    return await bcrypt.compare(refreshToken, user.refreshToken);
  }

  async refreshToken(user: User): Promise<AuthResponse> {
    return this.generateTokens(user);
  }

  async signOut(userId: string): Promise<void> {
    await this.userService.clearRefreshToken(userId);
  }
}
