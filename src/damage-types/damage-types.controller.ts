import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { DamageTypesService } from './damage-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {CreateDamageTypeDto} from "./dto/create-damage-type.dto";
import {UpdateDamageTypeDto} from "./dto/update-damage-type.dto";

@Controller('damage-types')
export class DamageTypesController {
  constructor(private damageTypesService: DamageTypesService) {}

  @Public()
  @Get('public')
  findAllPublic() {
    return this.damageTypesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createDto: CreateDamageTypeDto) {
    return this.damageTypesService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.damageTypesService.findAllAdmin();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.damageTypesService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.damageTypesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDamageTypeDto
  ) {
    return this.damageTypesService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleActiveStatus(@Param('id') id: string) {
    return this.damageTypesService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.damageTypesService.delete(id);
  }
}
