import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_AT_SECRET'),
    });
  }

  async validate(payload: AuthJwtPayload): Promise<Partial<User>> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: Missing user ID');
    }

    const user = await this.authService.validateJwtUser(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
