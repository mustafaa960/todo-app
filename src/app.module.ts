import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

interface OriginalError extends Error {
  message: string;
}
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TodoModule } from './todos/todo.module';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory() {
        return {
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          formatError: (error) => {
            const originalError = error.extensions
              ?.originalError as OriginalError;

            if (!originalError) {
              return {
                message: error.message,
                code: error.extensions?.code,
              };
            }
            return {
              message: originalError.message,
              code: error.extensions?.code,
            };
          },
        };
      },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    TodoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
