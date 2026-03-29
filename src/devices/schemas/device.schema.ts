import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {PaymentTiming} from "../../common/enums/payment-timing.enum";

export type DeviceDocument = Device & Document;

@Schema({ timestamps: true })
export class Device {
    @Prop({ required: true, trim: true })
    name!: string; // "iPhone 15"

    @Prop({ required: true, trim: true })
    brand!: string; // "Apple"

    @Prop({ trim: true })
    description?: string;

    @Prop([String])
    specifications?: string[];

    @Prop([String])
    images?: string[];

    @Prop({ default: true })
    isActive?: boolean;

    @Prop({
        type: [{
            model: { type: String, required: true }, // "Pro Max"
            memory: { type: String, required: true }, // "128GB"
            price: { type: Number, required: true, min: 0 },
            sku: { type: String }, // Código único opcional
            isActive: { type: Boolean, default: true }
        }],
        default: [],
    })
    variants?: Array<{
        model: string;
        memory: string;
        price: number;
        sku?: string;
        isActive?: boolean;
    }>;

    @Prop({
        type: [{
            saleMode: { type: String, enum: SaleMode, required: true },
            paymentTiming: { type: String, enum: PaymentTiming, required: true },
            discountAmount: { type: Number, required: true },
        }],
        default: [],
    })
    specificPricingPolicies?: Array<{
        saleMode: SaleMode;
        paymentTiming: PaymentTiming;
        discountAmount: number;
    }>;

    @Prop({
        type: [{
            damageType: { type: Types.ObjectId, ref: 'DamageType', required: true },
            defaultDiscountPercentage: { type: Number, required: true, min: 0 },
            operation: { type: String, enum: ['add', 'subtract'], default: 'subtract' },
            blocksSubmission: { type: Boolean, default: false },
        }],
        default: [],
    })
    applicableDamageTypes?: Array<{
        damageType: Types.ObjectId;
        defaultDiscountPercentage: number;
        operation: 'add' | 'subtract';
        blocksSubmission: boolean;
    }>;

    @Prop({
        type: [{
            conservationState: { type: Types.ObjectId, ref: 'ConservationState', required: true },
            value: { type: Number, required: true, min: 0 },
            operation: { type: String, enum: ['add', 'subtract'], default: 'subtract' },
        }],
        default: [],
    })
    applicableConservationStates?: Array<{
        conservationState: Types.ObjectId;
        value: number;
        operation: 'add' | 'subtract';
    }>;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({name: 1});
DeviceSchema.index({brand: 1, model: 1});
DeviceSchema.index({isActive: 1});
DeviceSchema.index({basePrice: 1});
