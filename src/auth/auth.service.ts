// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;

    // Verificar se o usuário já existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Usuário já existe com este email');
    }

    // Criar usuário (hash da senha é feito em UsersService)
    const user = await this.usersService.create({
      name,
      email,
      password,
      role: role || UserRole.USER,
    });

    // Gerar token JWT
    const token = await this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualizar último login
    await this.usersService.updateLastLogin(user._id);

    const token = await this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: 'Senha alterada com sucesso' };
  }

  async generateToken(user: any): Promise<string> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<number>('JWT_EXPIRES_IN'),
    });
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    const token = await this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
