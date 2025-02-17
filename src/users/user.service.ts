import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RolesService } from 'src/roles/roles.service';
import { RegisterUserInput } from 'src/auth/dto/register.input';
import { CreateUserWithRoleInput } from './dto/create-user.input';
import { UpdateOwnUserInput, UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private roleService: RolesService,
  ) {}
  async findAll(): Promise<User[]> {
    return this.userModel.find().lean().exec();
  }

  async register(input: RegisterUserInput): Promise<User> {
    const { username, password, fullName } = input;

    const existingUser = await this.userModel
      .findOne({ username })
      .lean()
      .exec();
    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = await this.roleService.findByName('User');
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      fullName,
      roleId: userRole._id,
    });

    return newUser.save();
  }

  async create(input: CreateUserWithRoleInput): Promise<User> {
    const { username, password, fullName, roleId } = input;
    const role = await this.roleService.findById(roleId);
    if (!role) {
      throw new BadRequestException('role not found');
    }
    const existingUser = await this.userModel
      .findOne({ username })
      .lean()
      .exec();
    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      fullName,
      roleId: new Types.ObjectId(roleId),
    });

    return newUser.save();
  }
  async updateOwnUser(
    userId: string,
    input: UpdateOwnUserInput,
  ): Promise<User> {
    const { password, fullName } = input;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    return user.save();
  }

  async updateAnyUser(userId: string, input: UpdateUserInput): Promise<User> {
    const { username, password, fullName, roleId } = input;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (fullName !== undefined) {
      user.fullName = fullName;
    }
    if (username !== undefined) {
      user.username = username;
    }
    if (roleId) {
      user.roleId = new Types.ObjectId(roleId);
    }

    return user.save();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).lean().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateHashedRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken: hashedToken })
      .lean()
      .exec();
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken: null })
      .lean()
      .exec();
  }
}
