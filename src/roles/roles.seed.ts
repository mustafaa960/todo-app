import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Resource } from './enums/resource.enum';
import { Action } from './enums/action.enum';

@Injectable()
export class RoleSeeder implements OnModuleInit {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async onModuleInit() {
    console.log('🔹 Seeding roles...');

    const roles = [
      {
        name: 'Admin',
        permissions: [
          {
            resource: Resource.TODOS,
            actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
          },
          {
            resource: Resource.USERS,
            actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
          },
          {
            resource: Resource.ROLES,
            actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
          },
        ],
      },
      {
        name: 'User',
        permissions: [
          {
            resource: Resource.TODOS,
            actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
          },
        ],
      },
    ];

    for (const role of roles) {
      const existingRole = await this.roleModel
        .findOne({ name: role.name })
        .exec();
      if (!existingRole) {
        await this.roleModel.create(role);
        console.log(`✅ Role "${role.name}" seeded`);
      } else {
        console.log(`⚠️ Role "${role.name}" already exists`);
      }
    }
  }
}
