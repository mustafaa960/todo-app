import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext.user;

    if (!user) {
      throw new UnauthorizedException('WebSocket authentication failed');
    }

    return true;
  }
}
