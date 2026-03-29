import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConservationState, ConservationStateDocument } from './schemas/conservation-state.schema';
import { CreateConservationStateDto, UpdateConservationStateDto } from './dto';

@Injectable()
export class ConservationStatesService {
    constructor(
        @InjectModel(ConservationState.name)
        private conservationStateModel: Model<ConservationStateDocument>,
    ) {}

    async create(dto: CreateConservationStateDto): Promise<ConservationStateDocument> {
        const existing = await this.conservationStateModel.findOne({ name: dto.name });
        if (existing) {
            throw new ConflictException('Estado de conservação já existe com este nome');
        }
        const state = new this.conservationStateModel(dto);
        return state.save();
    }

    async findAll(): Promise<ConservationStateDocument[]> {
        return this.conservationStateModel.find({ isActive: true }).sort({ name: 1 }).exec();
    }

    async findAllAdmin(): Promise<ConservationStateDocument[]> {
        return this.conservationStateModel.find().sort({ name: 1 }).exec();
    }

    async findById(id: string): Promise<ConservationStateDocument> {
        const state = await this.conservationStateModel.findById(id).exec();
        if (!state) {
            throw new NotFoundException('Estado de conservação não encontrado');
        }
        return state;
    }

    async update(id: string, dto: UpdateConservationStateDto): Promise<ConservationStateDocument> {
        if (dto.name) {
            const existing = await this.conservationStateModel.findOne({
                name: dto.name,
                _id: { $ne: id },
            });
            if (existing) {
                throw new ConflictException('Já existe outro estado de conservação com este nome');
            }
        }

        const state = await this.conservationStateModel.findByIdAndUpdate(id, dto, {
            new: true,
            runValidators: true,
        });

        if (!state) {
            throw new NotFoundException('Estado de conservação não encontrado');
        }

        return state;
    }

    async toggleActiveStatus(id: string): Promise<ConservationStateDocument> {
        const state = await this.conservationStateModel.findById(id);
        if (!state) {
            throw new NotFoundException('Estado de conservação não encontrado');
        }
        state.isActive = !state.isActive;
        return state.save();
    }

    async delete(id: string): Promise<void> {
        const result = await this.conservationStateModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new NotFoundException('Estado de conservação não encontrado');
        }
    }
}
