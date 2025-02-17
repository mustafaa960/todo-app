import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async findById(id: string): Promise<RoleDocument> {
    const role = await this.roleModel.findById(id).exec();
    return role;
  }
  async findByName(name: string): Promise<RoleDocument> {
    const role = await this.roleModel.findOne({ name }).exec();
    return role;
  }

  async create(input: CreateRoleInput): Promise<RoleDocument> {
    try {
      return this.roleModel.create(input);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Role name must be unique');
      }
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  async update(id: string, input: UpdateRoleInput): Promise<Role> {
    const role = await this.roleModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
