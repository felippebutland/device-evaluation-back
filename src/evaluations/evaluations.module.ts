// src/evaluations/evaluations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController, PublicEvaluationsController } from './evaluations.controller';
import { Evaluation, EvaluationSchema } from './schemas/evaluation.schema';
import { DeviceSubmissionsModule } from '../device-submissions/device-submissions.module';
import { DamageTypesModule } from '../damage-types/damage-types.module';
import { PricingPoliciesModule } from '../pricing-policies/pricing-policies.module';
import { DevicesModule } from '../devices/devices.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evaluation.name, schema: EvaluationSchema }
    ]),
    DeviceSubmissionsModule,
    DamageTypesModule,
    PricingPoliciesModule,
    DevicesModule,
    EmailModule,
  ],
  controllers: [EvaluationsController, PublicEvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
