// src/device-submissions/device-submissions.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {DeviceSubmission, DeviceSubmissionDocument} from './schemas/device-submission.schema';
import {DevicesService} from '../devices/devices.service';
import {EmailService} from '../email/email.service';
import {CreateDeviceSubmissionDto} from "./dto/create-submission.dto";
import {EvaluationStatus} from "../common/enums/evaluation-status.enum";
import {QuerySubmissionDto} from "./dto/query-submission.dto";
import {UpdateSubmissionStatusDto} from "./dto/update-submission-status.dto";

@Injectable()
export class DeviceSubmissionsService {
    constructor(
        @InjectModel(DeviceSubmission.name)
        private submissionModel: Model<DeviceSubmissionDocument>,
        private devicesService: DevicesService,
        private emailService: EmailService,
    ) {
    }

    async create(
        createDto: CreateDeviceSubmissionDto,
        userId?: string
    ): Promise<DeviceSubmissionDocument> {
        const device = await this.devicesService.findByIdPublic(createDto.deviceId);

        const existingSubmission = await this.submissionModel.findOne({
            deviceSerialNumber: createDto.deviceSerialNumber,
            status: {$in: [EvaluationStatus.PENDING, EvaluationStatus.APPROVED]},
        });

        if (existingSubmission) {
            throw new BadRequestException(
                'Já existe uma submissão ativa para este número de série'
            );
        }

        const submissionData: any = {
            ...createDto,
            userId: userId || null,
        };

        submissionData.applicableDamageTypes = createDto.applicableDamageTypes.map((item: any) => ({
            damageType: item.id,
            defaultDiscountPercentage: item.defaultDiscountPercentage,
        }));


        const submission = new this.submissionModel(submissionData);
        await submission.save();

        const emailAddress = userId
            ? (await this.getUserEmail(userId))
            : createDto.contactEmail;

        if (emailAddress) {
            await this.emailService.sendSubmissionConfirmation(
                emailAddress,
                submission.trackingCode!,
                device.name
            );
        }

        return submission.populate('deviceId', 'name brand model');
    }

    async findAll(queryDto: QuerySubmissionDto) {
        const {
            status,
            deviceId,
            userId,
            trackingCode,
            startDate,
            endDate,
            contactEmail,
        } = queryDto;

        const query: any = {};

        if (status) query.status = status;
        if (deviceId) query.deviceId = deviceId;
        if (userId) query.userId = userId;
        if (trackingCode) query.trackingCode = trackingCode;
        if (contactEmail) query.contactEmail = contactEmail;

        if (startDate || endDate) {
            query.submittedAt = {};
            if (startDate) query.submittedAt.$gte = new Date(startDate);
            if (endDate) query.submittedAt.$lte = new Date(endDate);
        }

        return this.submissionModel
            .find(query)
            .populate('deviceId', 'name brand model basePrice')
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name')
            .sort({submittedAt: -1})
            .exec();
    }

    async findById(id: string): Promise<DeviceSubmissionDocument> {
        const submission = await this.submissionModel
            .findById(id)
            .populate('deviceId', 'name brand model basePrice specifications images')
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name email')
            .exec();

        if (!submission) {
            throw new NotFoundException('Submissão não encontrada');
        }

        return submission;
    }

    async findByTrackingCode(trackingCode: string): Promise<DeviceSubmissionDocument> {
        const submission = await this.submissionModel
            .findOne({trackingCode})
            .populate('deviceId', 'name brand model')
            .exec();

        if (!submission) {
            throw new NotFoundException('Submissão não encontrada');
        }

        return submission;
    }

    async findUserSubmissions(userId: string) {
        return this.submissionModel
            .find({userId})
            .populate('deviceId', 'name brand model')
            .sort({submittedAt: -1})
            .exec();
    }

    async updateStatus(
        id: string,
        updateDto: UpdateSubmissionStatusDto,
        adminId: string
    ): Promise<DeviceSubmissionDocument> {
        const submission = await this.findById(id);

        // Verificar se mudança de status é válida
        if (submission.status === EvaluationStatus.APPROVED &&
            updateDto.status === EvaluationStatus.PENDING) {
            throw new BadRequestException(
                'Não é possível alterar status de aprovado para pendente'
            );
        }

        submission.status = updateDto.status;
        submission.reviewedBy = adminId as any;
        submission.reviewedAt = new Date();

        if (updateDto.adminNotes) {
            submission.adminNotes = updateDto.adminNotes;
        }

        await submission.save();

        return submission.populate('deviceId reviewedBy');
    }

    async delete(id: string): Promise<void> {
        const submission = await this.submissionModel.findById(id);

        if (!submission) {
            throw new NotFoundException('Submissão não encontrada');
        }

        // Só permitir exclusão se status for REJECTED ou PENDING
        if (submission.status === EvaluationStatus.APPROVED) {
            throw new BadRequestException(
                'Não é possível excluir submissão aprovada'
            );
        }

        await this.submissionModel.deleteOne({_id: id});
    }

    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.submissionModel.countDocuments(),
            this.submissionModel.countDocuments({status: EvaluationStatus.PENDING}),
            this.submissionModel.countDocuments({status: EvaluationStatus.APPROVED}),
            this.submissionModel.countDocuments({status: EvaluationStatus.REJECTED}),
        ]);

        // Submissões por dispositivo mais populares
        const topDevices = await this.submissionModel.aggregate([
            {$group: {_id: '$deviceId', count: {$sum: 1}}},
            {$sort: {count: -1}},
            {$limit: 10},
            {
                $lookup: {
                    from: 'devices',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'device'
                }
            },
            {$unwind: '$device'},
            {
                $project: {
                    deviceName: '$device.name',
                    brand: '$device.brand',
                    count: 1
                }
            }
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
            approvalRate: total > 0 ? (approved / total * 100).toFixed(2) : 0,
            topDevices,
        };
    }

    private async getUserEmail(userId: string): Promise<string | null> {
        // TODO: Implementar busca de email do usuário
        // Temporary mock - em implementação real, usar UsersService
        return null;
    }

    async getPendingSubmissions() {
        return this.submissionModel
            .find({status: EvaluationStatus.PENDING})
            .populate('deviceId', 'name brand model')
            .sort({submittedAt: 1}) // Mais antigos primeiro
            .exec();
    }

    async checkSubmissionOwnership(submissionId: string, userId: string): Promise<boolean> {
        const submission = await this.submissionModel.findById(submissionId);
        return submission?.userId?.toString() === userId;
    }
}
