// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {CreateUserDto} from "./dto/create-user.dto";
import {QueryUserDto} from "./dto/query-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {UpdateUserRoleDto} from "./dto/update-user-role.dto";

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.usersService.getStats();
  }

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto
  ) {
    // Usuários comuns só podem atualizar seus próprios dados
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any
  ) {
    // Impedir que admin altere seu próprio role
    if (id === currentUser.id && updateUserDto.role) {
      throw new ForbiddenException(
        'Não é possível alterar seu próprio role'
      );
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @CurrentUser() currentUser: any
  ) {
    // Impedir que admin altere seu próprio role
    if (id === currentUser.id) {
      throw new ForbiddenException(
        'Não é possível alterar seu próprio role'
      );
    }

    return this.usersService.updateRole(id, updateRoleDto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.ADMIN)
  toggleActiveStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: any
  ) {
    // Impedir que admin desative sua própria conta
    if (id === currentUser.id) {
      throw new ForbiddenException(
        'Não é possível alterar status de sua própria conta'
      );
    }

    return this.usersService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any
  ) {
    // Impedir que admin delete sua própria conta
    if (id === currentUser.id) {
      throw new ForbiddenException(
        'Não é possível excluir sua própria conta'
      );
    }

    return this.usersService.delete(id);
  }
}
