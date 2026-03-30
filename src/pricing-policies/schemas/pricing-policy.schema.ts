// src/pricing-policies/schemas/pricing-policy.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {PaymentTiming} from "../../common/enums/payment-timing.enum";

export type PricingPolicyDocument = PricingPolicy & Document;

@Schema({ timestamps: true })
export class PricingPolicy {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, enum: SaleMode, required: true })
  saleMode!: SaleMode;

  @Prop({ type: String, enum: PaymentTiming, required: true })
  paymentTiming!: PaymentTiming;

  // Desconto em valor fixo (em reais)
  @Prop({ required: true, min: 0 })
  discountAmount!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0, min: 0 })
  priority!: number; // Para ordenação
}

export const PricingPolicySchema = SchemaFactory.createForClass(PricingPolicy);

// Compound index para garantir unicidade por nome + modalidade + timing
PricingPolicySchema.index({ name: 1, saleMode: 1, paymentTiming: 1 }, { unique: true });
PricingPolicySchema.index({ isActive: 1 });
PricingPolicySchema.index({ priority: 1 });
