import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConservationStatesService } from './conservation-states.service';
import { ConservationStatesController } from './conservation-states.controller';
import { ConservationState, ConservationStateSchema } from './schemas/conservation-state.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConservationState.name, schema: ConservationStateSchema },
        ]),
    ],
    controllers: [ConservationStatesController],
    providers: [ConservationStatesService],
    exports: [ConservationStatesService],
})
export class ConservationStatesModule {}
