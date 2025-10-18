import { PartialType } from '@nestjs/mapped-types';
import {CreateDamageTypeDto} from "./create-damage-type.dto";

export class UpdateDamageTypeDto extends PartialType(CreateDamageTypeDto) {}
