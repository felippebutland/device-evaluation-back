import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {DeviceCondition} from "../../common/enums/device-condition.enum";
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {EvaluationStatus} from "../../common/enums/evaluation-status.enum";

export type DeviceSubmissionDocument = DeviceSubmission & Document;

@Schema({ timestamps: true })
export class DeviceSubmission {
    @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
    deviceId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @Prop({ trim: true })
    contactName?: string;

    @Prop({ trim: true, lowercase: true })
    contactEmail?: string;

    @Prop({ trim: true })
    contactPhone?: string;

    @Prop({ required: true, trim: true })
    deviceSerialNumber?: string;

    @Prop({ type: String, enum: DeviceCondition, required: true })
    reportedCondition?: DeviceCondition;

    @Prop([String])
    deviceImages?: string[];

    @Prop({ trim: true })
    userNotes?: string;

    @Prop({ type: String, enum: SaleMode, required: true })
    preferredSaleMode?: SaleMode;

    @Prop({ type: String, enum: EvaluationStatus, default: EvaluationStatus.PENDING })
    status?: EvaluationStatus;

    @Prop({ unique: true, sparse: true })
    trackingCode?: string;

    @Prop({ type: Date })
    submittedAt?: Date;

    @Prop({ type: Date })
    reviewedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    reviewedBy?: Types.ObjectId;

    @Prop({ trim: true })
    adminNotes?: string;

    @Prop({
        type: [{
            damageType: { type: Types.ObjectId, ref: 'DamageType', required: true },
            defaultDiscountPercentage: { type: Number, required: true, min: 0 },
        }],
        default: [],
    })
    applicableDamageTypes?: Array<{
        damageType: Types.ObjectId;
        defaultDiscountPercentage: number;
    }>;
}

export const DeviceSubmissionSchema = SchemaFactory.createForClass(DeviceSubmission);

DeviceSubmissionSchema.pre('save', function(next) {
    if (this.isNew && !this.trackingCode) {
        this.trackingCode = 'DS' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    if (this.isNew) {
        this.submittedAt = new Date();
    }
    next();
});

DeviceSubmissionSchema.index({ deviceId: 1 });
DeviceSubmissionSchema.index({ userId: 1 });
DeviceSubmissionSchema.index({ status: 1 });
DeviceSubmissionSchema.index({ trackingCode: 1 });
DeviceSubmissionSchema.index({ contactEmail: 1 });
DeviceSubmissionSchema.index({ submittedAt: -1 });
