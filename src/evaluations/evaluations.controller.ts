// src/evaluations/evaluations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {EvaluationsService} from "./evaluations.service";
import {CreateEvaluationDto} from "./dto/create-evaluation.dto";
import {ApproveEvaluationDto} from "./dto/approve-evaluation.dto";
import {RejectEvaluationDto} from "./dto/reject-evaluation.dto";

@Controller('evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  // Criar nova avaliação
  @Post()
  create(
    @Body() createDto: CreateEvaluationDto,
    @CurrentUser() user: any
  ) {
    return this.evaluationsService.create(createDto, user.id);
  }

  // Estatísticas de avaliações
  @Get('stats')
  getStats() {
    return this.evaluationsService.getStats();
  }

  // Buscar avaliação específica
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findById(id);
  }

  // Buscar avaliação por submissão
  @Get('submission/:submissionId')
  findBySubmissionId(@Param('submissionId') submissionId: string) {
    return this.evaluationsService.findBySubmissionId(submissionId);
  }

  // Aprovar avaliação
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveEvaluationDto,
    @CurrentUser() user: any
  ) {
    return this.evaluationsService.approve(id, approveDto, user.id);
  }

  // Rejeitar avaliação
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectEvaluationDto,
    @CurrentUser() user: any
  ) {
    return this.evaluationsService.reject(id, rejectDto, user.id);
  }
}

// Rota pública para acompanhar avaliação por tracking code
@Controller('public/evaluations')
export class PublicEvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Public()
  @Get('track/:trackingCode')
  async findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    // Esta rota permitiria acompanhar avaliação pelo tracking code
    // TODO: Implementar busca por tracking code na submissão
    // e retornar avaliação se existir
    return { message: 'Feature em desenvolvimento' };
  }
}
