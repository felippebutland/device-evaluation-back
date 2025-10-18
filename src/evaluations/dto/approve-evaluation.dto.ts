import {IsArray, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {IdentifiedDamageDto} from "./create-evaluation.dto";

export class ApproveEvaluationDto {
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