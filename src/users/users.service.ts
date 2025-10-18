import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';
import {CreateUserDto} from "./dto/create-user.dto";
import {User, UserDocument} from "./user.schema";
import {QueryUserDto} from "./dto/query-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {UpdateUserRoleDto} from "./dto/update-user-role.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Verificar se já existe usuário com este email
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email
    });

    if (existingUser) {
      throw new ConflictException('Usuário já existe com este email');
    }

    // Hash da senha se fornecida
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(queryDto: QueryUserDto) {
    const { name, email, role, isActive, page = 1, limit = 10 } = queryDto;

    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    // Verificar se o email não está sendo usado por outro usuário
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new ConflictException('Email já está sendo usado por outro usuário');
      }
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updateRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { role: updateRoleDto.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: id },
      { password: hashedPassword }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: id },
      { lastLogin: new Date() }
    );
  }

  async toggleActiveStatus(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async getStats() {
    const [total, active, admins, users] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ role: UserRole.ADMIN }),
      this.userModel.countDocuments({ role: UserRole.USER }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      admins,
      users,
    };
  }
}
