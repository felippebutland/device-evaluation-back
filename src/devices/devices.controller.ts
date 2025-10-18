import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {DevicesService} from "./devices.service";
import {QueryDeviceDto} from "./dto";
import {CreateDeviceDto} from "./dto";
import {UpdateDeviceDto} from "./dto";

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  // Rotas públicas (catálogo)
  @Public()
  @Get('public')
  findAllPublic(@Query() queryDto: QueryDeviceDto) {
    return this.devicesService.findPublic(queryDto);
  }

  @Public()
  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.devicesService.findByIdPublic(id);
  }

  @Public()
  @Get('brands/:brand')
  findByBrand(@Param('brand') brand: string) {
    return this.devicesService.findByBrand(brand);
  }

  // Rotas administrativas
  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  findAll(@Query() queryDto: QueryDeviceDto) {
    return this.devicesService.findAll(queryDto);
  }

  @Get('stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  getStats() {
    return this.devicesService.getStats();
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.devicesService.findById(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto
  ) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Patch(':id/toggle-active')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  toggleActiveStatus(@Param('id') id: string) {
    return this.devicesService.toggleActiveStatus(id);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.devicesService.delete(id);
  }
}
