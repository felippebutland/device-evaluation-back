// src/pricing-policies/pricing-policies.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {PricingPolicy, PricingPolicyDocument} from "./schemas/pricing-policy.schema";
import {CreatePricingPolicyDto} from "./dto/create-pricing-policy.dto";
import {UpdatePricingPolicyDto} from "./dto/update-pricing-policy.dto";
import {SaleMode} from "../common/enums/sale-mode.enum";
import {PaymentTiming} from "../common/enums/payment-timing.enum";

@Injectable()
export class PricingPoliciesService {
  constructor(
    @InjectModel(PricingPolicy.name)
    private pricingPolicyModel: Model<PricingPolicyDocument>,
  ) {}

  async create(createDto: CreatePricingPolicyDto): Promise<PricingPolicyDocument> {
    // Verificar se já existe política para esta combinação
    const existingPolicy = await this.pricingPolicyModel.findOne({
      saleMode: createDto.saleMode,
      paymentTiming: createDto.paymentTiming,
      name: createDto.name,
    });

    if (existingPolicy) {
      throw new ConflictException(
        'Já existe política com este nome, modalidade e prazo de pagamento'
      );
    }

    const policy = new this.pricingPolicyModel(createDto);
    return policy.save();
  }

  async findAll(): Promise<PricingPolicyDocument[]> {
    return this.pricingPolicyModel
      .find({ isActive: true })
      .sort({ priority: -1, saleMode: 1, paymentTiming: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<PricingPolicyDocument[]> {
    return this.pricingPolicyModel
      .find()
      .sort({ priority: -1, saleMode: 1, paymentTiming: 1 })
      .exec();
  }

  async findById(id: string): Promise<PricingPolicyDocument> {
    const policy = await this.pricingPolicyModel.findById(id).exec();

    if (!policy) {
      throw new NotFoundException('Política de preços não encontrada');
    }

    return policy;
  }

  async update(id: string, updateDto: UpdatePricingPolicyDto): Promise<PricingPolicyDocument> {
    // Verificar conflito se mudando saleMode, paymentTiming ou name
    if (updateDto.saleMode || updateDto.paymentTiming || updateDto.name) {
      const conflictQuery: any = { _id: { $ne: id } };

      if (updateDto.saleMode) conflictQuery.saleMode = updateDto.saleMode;
      if (updateDto.paymentTiming) conflictQuery.paymentTiming = updateDto.paymentTiming;
      if (updateDto.name) conflictQuery.name = updateDto.name;

      const existingPolicy = await this.pricingPolicyModel.findOne(conflictQuery);
      if (existingPolicy) {
        throw new ConflictException(
          'Já existe política com este nome, modalidade e prazo de pagamento'
        );
      }
    }

    const policy = await this.pricingPolicyModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true, runValidators: true }
    );

    if (!policy) {
      throw new NotFoundException('Política de preços não encontrada');
    }

    return policy;
  }

  async delete(id: string): Promise<void> {
    const result = await this.pricingPolicyModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Política de preços não encontrada');
    }
  }

  async calculateFinalPrice(
    adjustedPrice: number,
    saleMode: SaleMode,
    paymentTiming: PaymentTiming,
    deviceSpecificPolicies?: any[]
  ) {
    let discountAmount = 0;

    // Verificar se há política específica do dispositivo
    if (deviceSpecificPolicies?.length) {
      const specificPolicy = deviceSpecificPolicies.find(
        p => p.saleMode === saleMode && p.paymentTiming === paymentTiming
      );

      if (specificPolicy) {
        discountAmount = specificPolicy.discountAmount;
      }
    }

    // Se não há política específica, usar política global
    if (discountAmount === 0) {
      const globalPolicy = await this.pricingPolicyModel.findOne({
        saleMode,
        paymentTiming,
        isActive: true,
      });

      if (globalPolicy) {
        discountAmount = globalPolicy.discountAmount;
      }
    }

    const finalPrice = Math.max(0, adjustedPrice - discountAmount);

    return {
      saleMode,
      paymentTiming,
      adjustedPrice,
      discountAmount,
      finalPrice,
    };
  }

  async getDefaultPolicies() {
    // Retorna as políticas padrão para todas as combinações
    const policies = await this.findAll();

    const defaultPolicies = {};

    Object.values(SaleMode).forEach(saleMode => {
      // @ts-ignore
        defaultPolicies[saleMode] = {};
      Object.values(PaymentTiming).forEach(paymentTiming => {
        const policy = policies.find(
          p => p.saleMode === saleMode && p.paymentTiming === paymentTiming
        );
        // @ts-ignore
          defaultPolicies[saleMode][paymentTiming] = policy?.discountAmount || 0;
      });
    });

    return defaultPolicies;
  }
}
