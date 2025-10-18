// src/device-submissions/device-submissions.controller.ts
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
import { DeviceSubmissionsService } from './device-submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {QuerySubmissionDto} from "./dto/query-submission.dto";
import {CreateDeviceSubmissionDto} from "./dto/create-submission.dto";
import {UpdateSubmissionStatusDto} from "./dto/update-submission-status.dto";

@Controller('device-submissions')
export class DeviceSubmissionsController {
  constructor(private submissionsService: DeviceSubmissionsService) {}

  @Public()
  @Post('public')
  createPublic(@Body() createDto: CreateDeviceSubmissionDto) {
    return this.submissionsService.create(createDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDto: CreateDeviceSubmissionDto,
    @CurrentUser() user: any
  ) {
    return this.submissionsService.create(createDto, user.id);
  }

  @Public()
  @Get('track/:trackingCode')
  findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return this.submissionsService.findByTrackingCode(trackingCode);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() queryDto: QuerySubmissionDto) {
    return this.submissionsService.findAll(queryDto);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.submissionsService.getPendingSubmissions();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.submissionsService.getStats();
  }

  @Get('my-submissions')
  @UseGuards(JwtAuthGuard)
  getMySubmissions(@CurrentUser() user: any) {
    return this.submissionsService.findUserSubmissions(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const submission = await this.submissionsService.findById(id);

    if (user.role !== UserRole.ADMIN) {
      const hasPermission = await this.submissionsService.checkSubmissionOwnership(
        id,
        user.id
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          'Você só pode visualizar suas próprias submissões'
        );
      }
    }

    return submission;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubmissionStatusDto,
    @CurrentUser() user: any
  ) {
    return this.submissionsService.updateStatus(id, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.submissionsService.delete(id);
  }
}
