// src/evaluations/schemas/evaluation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {EvaluationStatus} from "../../common/enums/evaluation-status.enum";
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {PaymentTiming} from "../../common/enums/payment-timing.enum";

export type EvaluationDocument = Evaluation & Document;

@Schema({ timestamps: true })
export class Evaluation {
    @Prop({ type: Types.ObjectId, ref: 'DeviceSubmission', required: true, unique: true })
    submissionId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    evaluatedBy?: Types.ObjectId;

    @Prop({ type: String, enum: EvaluationStatus, default: EvaluationStatus.PENDING })
    status?: EvaluationStatus;

    @Prop([{
        damageTypeId: { type: Types.ObjectId, ref: 'DamageType', required: true },
        discountPercentage: { type: Number, min: 0, max: 100 },
        discountAmount: { type: Number, min: 0 },
        notes: { type: String, trim: true },
    }])
    identifiedDamages?: Array<{
        damageTypeId: Types.ObjectId;
        discountPercentage?: number;
        discountAmount?: number;
        notes?: string;
    }>;

    @Prop({ required: true, min: 0 })
    originalPrice?: number;

    @Prop({ required: true, min: 0 })
    totalDamageDeduction?: number;

    @Prop({ required: true, min: 0 })
    adjustedPrice?: number;

    @Prop([{
        saleMode: { type: String, enum: SaleMode, required: true },
        paymentTiming: { type: String, enum: PaymentTiming, required: true },
        finalPrice: { type: Number, required: true, min: 0 },
        appliedDiscount: { type: Number, required: true, min: 0 },
    }])
    finalPrices!: Array<{
        saleMode: SaleMode;
        paymentTiming: PaymentTiming;
        finalPrice: number;
        appliedDiscount: number;
    }>;

    @Prop({ trim: true })
    evaluationNotes?: string;

    @Prop({ trim: true })
    rejectionReason!: string;

    @Prop({ type: Date, default: Date.now })
    evaluatedAt?: Date;

    @Prop({ type: Date })
    approvedAt?: Date;

    @Prop({ type: Date })
    rejectedAt?: Date;

    @Prop({ default: 7, min: 1 })
    validityDays?: number;

    @Prop({ type: Date })
    expiresAt?: Date;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);

EvaluationSchema.pre('save', function(next) {
    if (this.approvedAt && this.validityDays) {
        const expirationDate = new Date(this.approvedAt);
        expirationDate.setDate(expirationDate.getDate() + this.validityDays);
        this.expiresAt = expirationDate;
    }
    next();
});

// Indexes
EvaluationSchema.index({ submissionId: 1 });
EvaluationSchema.index({ evaluatedBy: 1 });
EvaluationSchema.index({ status: 1 });
EvaluationSchema.index({ evaluatedAt: -1 });
EvaluationSchema.index({ expiresAt: 1 });
