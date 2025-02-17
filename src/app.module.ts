import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication, Inject, Module, OnModuleInit } from '@nestjs/common';
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
import { RolesModule } from './roles/roles.module';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { PubSubModule } from './pubsub/pubsub.module';
import { PubSub } from 'graphql-subscriptions';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Context } from 'graphql-ws';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory() {
        return {
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          subscriptions: {
            'graphql-ws': {
              path: '/graphql',
              onConnect: async (context: Context<any>) => {
                try {
                  const { connectionParams, extra } = context;
                  const authHeader: any =
                    connectionParams?.Authorization ||
                    connectionParams?.authorization;

                  if (!authHeader) {
                    return {};
                  }

                  const token = authHeader.replace('Bearer ', '');
                  const decoded = AppModule.jwtService.verify(token);
                  if (!decoded?.sub) throw new Error('Invalid token');

                  const user = await AppModule.authService.validateJwtUser(
                    decoded.sub,
                  );
                  if (!user) throw new Error('User not found');

                  (extra as Record<string, any>).user = user;
                  return { user };
                } catch (error) {
                  return {};
                }
              },
            },
          },
          context: async ({ extra }) => {
            if (extra?.user) {
              return { user: extra.user };
            }
            return {};
          },
          formatError: (error: GraphQLError) => {
            const originalError = error.extensions?.originalError as any;
            let statusCode = originalError?.statusCode || 500;
            let message = originalError?.message || error.message;

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
    RolesModule,
    PubSubModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    { provide: 'PUB_SUB', useValue: new PubSub() },
  ],
  exports: ['PUB_SUB'],
})
export class AppModule {
  static jwtService: JwtService;
  static authService: AuthService;

  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    AppModule.authService = this.authService;
    AppModule.jwtService = this.jwtService;
  }
}

