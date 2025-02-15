import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

import { RefreshStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    PassportModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy
  ],
})
export class AuthModule {}
