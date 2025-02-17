import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RolesService } from '../roles/roles.service';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UserService);
  const rolesService = app.get(RolesService);

  // 🔹 Check if admin role already exists
  let adminRole = await rolesService.findByName('Admin');
  
  if (!adminRole) {
    console.log('🚀 Creating Admin Role...');
    adminRole = await rolesService.create({
      name: 'Admin',
      permissions: [
        { resource: Resource.USERS, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE] },
        { resource: Resource.TODOS, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE] }
      ],
    });
    console.log('✅ Admin Role Created');
  }

  // 🔹 Check if admin user already exists
  let adminUser = await usersService.findByUsername('admin');

  if (!adminUser) {
    console.log('🚀 Creating Admin User...');
 

    adminUser = await usersService.create({
      username: 'admin',
      password: "admin",
      fullName: 'Admin',
      roleId: adminRole._id, // Assign admin role
    });

    console.log('✅ Admin User Created:', adminUser);
  } else {
    console.log('⚡ Admin User Already Exists:', adminUser);
  }

  await app.close();
}

bootstrap();
