import { PartialType } from '@nestjs/mapped-types';
import { CreateConservationStateDto } from './create-conservation-state.dto';

export class UpdateConservationStateDto extends PartialType(CreateConservationStateDto) {}
