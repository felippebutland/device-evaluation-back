// src/pricing-policies/pricing-policies.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingPoliciesService } from './pricing-policies.service';
import { PricingPoliciesController } from './pricing-policies.controller';
import { PricingPolicy, PricingPolicySchema } from './schemas/pricing-policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingPolicy.name, schema: PricingPolicySchema }
    ]),
  ],
  controllers: [PricingPoliciesController],
  providers: [PricingPoliciesService],
  exports: [PricingPoliciesService],
})
export class PricingPoliciesModule {}
