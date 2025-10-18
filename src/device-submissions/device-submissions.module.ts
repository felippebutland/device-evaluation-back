import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceSubmissionsService } from './device-submissions.service';
import { DeviceSubmissionsController } from './device-submissions.controller';
import { DeviceSubmission, DeviceSubmissionSchema } from './schemas/device-submission.schema';
import { DevicesModule } from '../devices/devices.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceSubmission.name, schema: DeviceSubmissionSchema }
    ]),
    DevicesModule,
    EmailModule,
  ],
  controllers: [DeviceSubmissionsController],
  providers: [DeviceSubmissionsService],
  exports: [DeviceSubmissionsService],
})
export class DeviceSubmissionsModule {}
