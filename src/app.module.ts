import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { DamageTypesModule } from './damage-types/damage-types.module';
import { PricingPoliciesModule } from './pricing-policies/pricing-policies.module';
import { DeviceSubmissionsModule } from './device-submissions/device-submissions.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { EmailModule } from './email/email.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import {validate} from "./env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate,
    }),

    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    AuthModule,
    UsersModule,
    DevicesModule,
    DamageTypesModule,
    PricingPoliciesModule,
    DeviceSubmissionsModule,
    EvaluationsModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
