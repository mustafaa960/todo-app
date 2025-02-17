import {
  Injectable,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginInput } from '../dto/login.input';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);

    await this.validateLoginInput(req.body);

    try {
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials1');
    }
  }

  getRequest(context: ExecutionContext) {
    let req;
  
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else {
      const gqlExecutionContext = GqlExecutionContext.create(context);
      const gqlContext = gqlExecutionContext.getContext();
      const gqlArgs = gqlExecutionContext.getArgs();
  
      req = gqlContext.req;
      // 🔥 Fix: Extract input fields properly when using @InputType()
      req.body = gqlArgs.input ? { ...gqlArgs.input } : {};
    }
  
    return req;
  }
  

  private async validateLoginInput(body: any) {
    const loginInput = plainToInstance(LoginInput, body);
    const errors = await validate(loginInput);

    if (errors.length > 0) {
      const errorMessage = errors
        .map((e) => Object.values(e.constraints).join(', '))
        .join(', ');
      throw new BadRequestException(errorMessage);
    }
  }
}
