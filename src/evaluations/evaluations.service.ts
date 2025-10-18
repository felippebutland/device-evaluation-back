// src/evaluations/evaluations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Evaluation, EvaluationDocument } from './schemas/evaluation.schema';
import { DeviceSubmissionsService } from '../device-submissions/device-submissions.service';
import { DamageTypesService } from '../damage-types/damage-types.service';
import { PricingPoliciesService } from '../pricing-policies/pricing-policies.service';
import { DevicesService } from '../devices/devices.service';
import { EmailService } from '../email/email.service';
import {EvaluationStatus} from "../common/enums/evaluation-status.enum";
import {CreateEvaluationDto} from "./dto/create-evaluation.dto";
import {ApproveEvaluationDto} from "./dto/approve-evaluation.dto";
import {RejectEvaluationDto} from "./dto/reject-evaluation.dto";
import {SaleMode} from "../common/enums/sale-mode.enum";
import {PaymentTiming} from "../common/enums/payment-timing.enum";

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectModel(Evaluation.name)
    private evaluationModel: Model<EvaluationDocument>,
    private submissionsService: DeviceSubmissionsService,
    private damageTypesService: DamageTypesService,
    private pricingPoliciesService: PricingPoliciesService,
    private devicesService: DevicesService,
    private emailService: EmailService,
  ) {}

  async create(
    createDto: CreateEvaluationDto,
    evaluatorId: string
  ): Promise<EvaluationDocument> {
    // Verificar se submissão existe e está pendente
    const submission = await this.submissionsService.findById(createDto.submissionId);

    if (submission.status !== EvaluationStatus.PENDING) {
      throw new BadRequestException(
        'Só é possível avaliar submissões com status pendente'
      );
    }

    // Verificar se já existe avaliação para esta submissão
    const existingEvaluation = await this.evaluationModel.findOne({
      submissionId: createDto.submissionId,
    });

    if (existingEvaluation) {
      throw new ConflictException('Já existe uma avaliação para esta submissão');
    }

    // Buscar informações do dispositivo
    const device = await this.devicesService.findById(submission.deviceId.toString());

    // Calcular valores
    const calculations = await this.calculateEvaluationPrices(
      device,
      createDto.identifiedDamages || []
    );

    const evaluationData = {
      submissionId: createDto.submissionId,
      evaluatedBy: evaluatorId,
      originalPrice: '',
      totalDamageDeduction: calculations.totalDamageDeduction,
      adjustedPrice: calculations.adjustedPrice,
      finalPrices: calculations.finalPrices.map(fp => ({
        saleMode: fp.saleMode,
        paymentTiming: fp.paymentTiming,
        finalPrice: fp.finalPrice,
        appliedDiscount: fp.discountAmount,
      })),
      identifiedDamages: (createDto.identifiedDamages || []).map(d => ({
        damageTypeId: new Types.ObjectId(d.damageTypeId!),
        discountPercentage: d.discountPercentage,
        discountAmount: d.discountAmount,
        notes: d.notes,
      })),
      evaluationNotes: createDto.evaluationNotes,
      validityDays: createDto.validityDays || 7,
    };

    const evaluation = new this.evaluationModel(evaluationData);
    await evaluation.save();

    return evaluation.populate('submissionId evaluatedBy');
  }

  async approve(
    id: string,
    approveDto: ApproveEvaluationDto,
    evaluatorId: string
  ): Promise<EvaluationDocument> {
    const evaluation = await this.findById(id);

    if (evaluation.status !== EvaluationStatus.PENDING) {
      throw new BadRequestException(
        'Só é possível aprovar avaliações pendentes'
      );
    }

    // Recalcular se houve mudanças nas avarias
    if (approveDto.identifiedDamages) {
      const submission = await this.submissionsService.findById(
        evaluation.submissionId!.toString()
      );
      const device = await this.devicesService.findById(
        submission.deviceId.toString()
      );

      const calculations = await this.calculateEvaluationPrices(
        device,
        approveDto.identifiedDamages
      );

      evaluation.totalDamageDeduction = calculations.totalDamageDeduction;
      evaluation.adjustedPrice = calculations.adjustedPrice;
      evaluation.finalPrices = calculations.finalPrices.map(fp => ({
        saleMode: fp.saleMode,
        paymentTiming: fp.paymentTiming,
        finalPrice: fp.finalPrice,
        appliedDiscount: fp.discountAmount,
      }));
      evaluation.identifiedDamages = approveDto.identifiedDamages.map(d => ({
        damageTypeId: new Types.ObjectId(d.damageTypeId!),
        discountPercentage: d.discountPercentage,
        discountAmount: d.discountAmount,
        notes: d.notes,
      })) as any;
    }

    evaluation.status = EvaluationStatus.APPROVED;
    evaluation.approvedAt = new Date();
    evaluation.evaluatedBy = evaluatorId as any;

    if (approveDto.evaluationNotes) {
      evaluation.evaluationNotes = approveDto.evaluationNotes;
    }

    if (approveDto.validityDays) {
      evaluation.validityDays = approveDto.validityDays;
    }

    await evaluation.save();

    // Atualizar status da submissão
    await this.submissionsService.updateStatus(
      evaluation.submissionId!.toString(),
      { status: EvaluationStatus.APPROVED },
      evaluatorId
    );

    // Enviar email de aprovação
    await this.sendApprovalEmail(evaluation);

    return evaluation.populate('submissionId evaluatedBy');
  }

  async reject(
    id: string,
    rejectDto: RejectEvaluationDto,
    evaluatorId: string
  ): Promise<EvaluationDocument> {
    const evaluation = await this.findById(id);

    if (evaluation.status !== EvaluationStatus.PENDING) {
      throw new BadRequestException(
        'Só é possível rejeitar avaliações pendentes'
      );
    }

    evaluation.status = EvaluationStatus.REJECTED;
    evaluation.rejectedAt = new Date();
    evaluation.rejectionReason = rejectDto.rejectionReason;
    evaluation.evaluatedBy = evaluatorId as any;

    if (rejectDto.evaluationNotes) {
      evaluation.evaluationNotes = rejectDto.evaluationNotes;
    }

    await evaluation.save();

    // Atualizar status da submissão
    await this.submissionsService.updateStatus(
      evaluation.submissionId!.toString(),
      {
        status: EvaluationStatus.REJECTED,
        adminNotes: rejectDto.rejectionReason
      },
      evaluatorId
    );

    // Enviar email de rejeição
    await this.sendRejectionEmail(evaluation);

    return evaluation.populate('submissionId evaluatedBy');
  }

  async findById(id: string): Promise<EvaluationDocument> {
    const evaluation = await this.evaluationModel
      .findById(id)
      .populate('submissionId')
      .populate('evaluatedBy', 'name email')
      .populate('identifiedDamages.damageTypeId')
      .exec();

    if (!evaluation) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return evaluation;
  }

  async findBySubmissionId(submissionId: string): Promise<EvaluationDocument | null> {
    return this.evaluationModel
      .findOne({ submissionId })
      .populate('submissionId')
      .populate('evaluatedBy', 'name email')
      .populate('identifiedDamages.damageTypeId')
      .exec();
  }

  private async calculateEvaluationPrices(device: any, damages: any[]) {
    let totalDamageDeduction = 0;

    // Calcular descontos por avarias
    for (const damage of damages) {
      if (damage.discountAmount) {
        totalDamageDeduction += damage.discountAmount;
      } else if (damage.discountPercentage) {
        totalDamageDeduction += (device.basePrice * damage.discountPercentage) / 100;
      } else {
        // Usar valor padrão do tipo de avaria
        const damageType = await this.damageTypesService.findById(damage.damageTypeId);
        if (damageType.defaultDiscountAmount) {
          totalDamageDeduction += damageType.defaultDiscountAmount;
        } else {
          totalDamageDeduction += (device.basePrice * damageType.defaultDiscountPercentage) / 100;
        }
      }
    }

    const adjustedPrice = Math.max(0, device.basePrice - totalDamageDeduction);

    // Calcular preços finais para todas as modalidades
    const finalPrices = [];

    for (const saleMode of Object.values(SaleMode)) {
      for (const paymentTiming of Object.values(PaymentTiming)) {
        const priceCalculation = await this.pricingPoliciesService.calculateFinalPrice(
          adjustedPrice,
          saleMode,
          paymentTiming,
          device.specificPricingPolicies
        );

        finalPrices.push(priceCalculation);
      }
    }

    return {
      totalDamageDeduction,
      adjustedPrice,
      finalPrices,
    };
  }

  private async sendApprovalEmail(evaluation: EvaluationDocument) {
    const submission = evaluation.submissionId as any;
    const device = await this.devicesService.findById(submission.deviceId);

    const contactEmail = submission.userId
      ? 'user-email@example.com' // TODO: buscar email do usuário
      : submission.contactEmail;

    if (contactEmail) {
      await this.emailService.sendEvaluationApproved(
        contactEmail,
        submission.trackingCode,
        device.name,
        evaluation.finalPrices,
        evaluation.expiresAt || new Date()
      );
    }
  }

  private async sendRejectionEmail(evaluation: EvaluationDocument) {
    const submission = evaluation.submissionId as any;
    const device = await this.devicesService.findById(submission.deviceId);

    const contactEmail = submission.userId
      ? 'user-email@example.com' // TODO: buscar email do usuário
      : submission.contactEmail;

    if (contactEmail) {
      await this.emailService.sendEvaluationRejected(
        contactEmail,
        submission.trackingCode,
        device.name,
        evaluation.rejectionReason || ''
      );
    }
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.evaluationModel.countDocuments(),
      this.evaluationModel.countDocuments({ status: EvaluationStatus.PENDING }),
      this.evaluationModel.countDocuments({ status: EvaluationStatus.APPROVED }),
      this.evaluationModel.countDocuments({ status: EvaluationStatus.REJECTED }),
    ]);

    // Valor médio das avaliações aprovadas
    const avgValue = await this.evaluationModel.aggregate([
      { $match: { status: EvaluationStatus.APPROVED } },
      { $group: { _id: null, avgPrice: { $avg: '$adjustedPrice' } } }
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? (approved / total * 100).toFixed(2) : 0,
      averageApprovedValue: avgValue[0]?.avgPrice || 0,
    };
  }
}
