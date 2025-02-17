import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-jwt') {
  constructor() {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = this.getRequest(context);
    return super.canActivate(new ExecutionContextHost([req]));
  }

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    return gqlContext.req;
  }
}
