import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

import { RefreshStrategy } from './strategies/refresh-token.strategy';
import { RolesModule } from 'src/roles/roles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_AT_SECRET'), // ✅ Use secret from .env
        signOptions: { expiresIn: configService.get<string>('JWT_AT_EXPIRES') }, // ✅ Set expiration time
      }),
    }),
    UsersModule,
    PassportModule,
    RolesModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtService,
    AuthResolver,
    LocalStrategy,
    RefreshStrategy,
  ],
  exports: [AuthService,JwtModule,JwtStrategy],
})
export class AuthModule {}
