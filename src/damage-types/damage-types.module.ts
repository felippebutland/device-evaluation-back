import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DamageTypesService } from './damage-types.service';
import { DamageTypesController } from './damage-types.controller';
import { DamageType, DamageTypeSchema } from './schemas/damage-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DamageType.name, schema: DamageTypeSchema }
    ]),
  ],
  controllers: [DamageTypesController],
  providers: [DamageTypesService],
  exports: [DamageTypesService],
})
export class DamageTypesModule {}
