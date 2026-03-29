// src/damage-types/damage-types.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DamageType, DamageTypeDocument } from './schemas/damage-type.schema';
import { CreateDamageTypeDto, UpdateDamageTypeDto } from './dto';

@Injectable()
export class DamageTypesService {
  constructor(
    @InjectModel(DamageType.name) private damageTypeModel: Model<DamageTypeDocument>,
  ) {}

  async create(createDamageTypeDto: CreateDamageTypeDto): Promise<DamageTypeDocument> {
    // Verificar se já existe tipo de avaria com este nome
    const existingDamageType = await this.damageTypeModel.findOne({
      name: createDamageTypeDto.name,
    });

    if (existingDamageType) {
      throw new ConflictException('Tipo de avaria já existe com este nome');
    }

    const damageType = new this.damageTypeModel(createDamageTypeDto);
    return damageType.save();
  }

  async findAll(): Promise<DamageTypeDocument[]> {
    return this.damageTypeModel
      .find({ isActive: true })
      .sort({ priority: -1, name: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<DamageTypeDocument[]> {
    return this.damageTypeModel
      .find()
      .sort({ priority: -1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<DamageTypeDocument> {
    const damageType = await this.damageTypeModel.findById(id).exec();

    if (!damageType) {
      throw new NotFoundException('Tipo de avaria não encontrado');
    }

    return damageType;
  }

  async update(id: string, updateDamageTypeDto: UpdateDamageTypeDto): Promise<DamageTypeDocument> {
    // Verificar se não existe outro tipo de avaria com mesmo nome
    if (updateDamageTypeDto.name) {
      const existingDamageType = await this.damageTypeModel.findOne({
        name: updateDamageTypeDto.name,
        _id: { $ne: id },
      });

      if (existingDamageType) {
        throw new ConflictException(
          'Já existe outro tipo de avaria com este nome'
        );
      }
    }

    const damageType = await this.damageTypeModel.findByIdAndUpdate(
      id,
      updateDamageTypeDto,
      { new: true, runValidators: true }
    );

    if (!damageType) {
      throw new NotFoundException('Tipo de avaria não encontrado');
    }

    return damageType;
  }

  async toggleActiveStatus(id: string): Promise<DamageTypeDocument> {
    const damageType = await this.damageTypeModel.findById(id);
    if (!damageType) {
      throw new NotFoundException('Tipo de avaria não encontrado');
    }

    damageType.isActive = !damageType.isActive;
    await damageType.save();

    return damageType;
  }

  async delete(id: string): Promise<void> {
    // TODO: Verificar se existem dispositivos usando este tipo de avaria
    const result = await this.damageTypeModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Tipo de avaria não encontrado');
    }
  }

  async calculateDamageDeduction(damageTypeId: string, deviceBasePrice: number) {
    const damageType = await this.findById(damageTypeId);

    let amount = 0;

    if (damageType.defaultDiscountAmount) {
      amount = damageType.defaultDiscountAmount;
    } else {
      amount = (deviceBasePrice * damageType.defaultDiscountPercentage) / 100;
    }

    const deduction = damageType.operation === 'add' ? -amount : amount;

    return {
      damageType: damageType.name,
      operation: damageType.operation,
      deduction,
      percentage: (amount / deviceBasePrice) * 100,
    };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.damageTypeModel.countDocuments(),
      this.damageTypeModel.countDocuments({ isActive: true }),
    ]);

    const avgDiscount = await this.damageTypeModel.aggregate([
      { $group: { _id: null, avgDiscount: { $avg: '$defaultDiscountPercentage' } } }
    ]);

    return {
      total,
      active,
      inactive: total - active,
      averageDiscountPercentage: avgDiscount[0]?.avgDiscount || 0,
    };
  }

  async findByIds(ids: string[]): Promise<DamageTypeDocument[]> {
    return this.damageTypeModel.find({
      _id: { $in: ids },
      isActive: true,
    }).exec();
  }
}
