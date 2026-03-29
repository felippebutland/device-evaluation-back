import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DamageTypeDocument = DamageType & Document;

@Schema({ timestamps: true })
export class DamageType {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ required: true, min: 0, max: 100 })
    defaultDiscountPercentage!: number;

    @Prop({ min: 0 })
    defaultDiscountAmount?: number;

    @Prop({ default: 'subtract', enum: ['add', 'subtract'] })
    operation!: 'add' | 'subtract';

    @Prop({ default: false })
    blocksSubmission!: boolean;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ default: 0, min: 0 })
    priority!: number;
}

export const DamageTypeSchema = SchemaFactory.createForClass(DamageType);

DamageTypeSchema.index({ name: 1 });
DamageTypeSchema.index({ isActive: 1 });
DamageTypeSchema.index({ priority: 1 });
