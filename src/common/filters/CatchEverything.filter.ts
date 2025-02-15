import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchEverythingFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() === 'http') {
      this.handleHttpException(exception, host);
    } else {
      this.handleGraphQLException(exception, host);
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof response === 'object' && response !== null
        ? (response as any).message || 'An error occurred'
        : response || 'An error occurred';

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
    };

    this.logger.error(`HTTP Exception: ${JSON.stringify(responseBody)}`);
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      statusCode = exception.getStatus();
      message =
        typeof response === 'object' && response !== null
          ? (response as any).message || 'An error occurred'
          : response || 'An error occurred';
    }

    this.logger.error(
      `GraphQL Exception: ${JSON.stringify({ statusCode, message })}`
    );

    throw new HttpException(
      {
        statusCode,
        message,
        errorType:
          statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
        field: gqlHost.getInfo()?.fieldName || null,
      },
      statusCode
    );
  }
}
