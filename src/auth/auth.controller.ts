// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logout realizado com sucesso' };
  }
}
