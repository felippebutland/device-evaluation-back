import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConservationStateDocument = ConservationState & Document;

@Schema({ timestamps: true })
export class ConservationState {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ default: 'subtract', enum: ['add', 'subtract'] })
    operation!: 'add' | 'subtract';

    @Prop({ default: true })
    isActive!: boolean;
}

export const ConservationStateSchema = SchemaFactory.createForClass(ConservationState);

ConservationStateSchema.index({ name: 1 });
ConservationStateSchema.index({ isActive: 1 });
