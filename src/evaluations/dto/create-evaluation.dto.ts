import {
    IsMongoId,
    IsArray,
    IsOptional,
    IsNumber,
    Min,
    Max,
    IsString,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class IdentifiedDamageDto {
    @IsMongoId()
    damageTypeId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class CreateEvaluationDto {
    @IsMongoId()
    submissionId!: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IdentifiedDamageDto)
    identifiedDamages?: IdentifiedDamageDto[];

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    evaluationNotes?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(30)
    validityDays?: number = 7;
}