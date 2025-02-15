import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Module,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TodoModule } from './todos/todo.module';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GraphQLError } from 'graphql';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory() {
        return {
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          autoTransformHttpErrors: true,

          formatError: (error: GraphQLError) => {
            const originalError = error.extensions?.originalError as any;
            let statusCode = originalError?.statusCode || 500;
            let message = originalError?.message || error.message;

            // ✅ Detect GraphQL validation errors (e.g., missing required variables)
            if (error.message.startsWith('Variable')) {
              statusCode = 400;
            }

            if (
              originalError?.response &&
              Array.isArray(originalError.response.message)
            ) {
              statusCode = 400;
              message = originalError.response.message.join(', ');
            }

            const errorTypeMap: { [key: number]: string } = {
              400: 'BAD_REQUEST',
              401: 'UNAUTHORIZED',
              403: 'FORBIDDEN',
              404: 'NOT_FOUND',
              409: 'CONFLICT',
              500: 'INTERNAL_SERVER_ERROR',
            };

            const errorType = errorTypeMap[statusCode] || 'GRAPHQL_ERROR';

            return {
              statusCode,
              message,
              errorType,
              field: error.path ? error.path.join('.') : null,
            };
          },
        };
      },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    TodoModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

