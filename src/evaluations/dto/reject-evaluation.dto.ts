import {IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";

export class RejectEvaluationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    rejectionReason!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    evaluationNotes?: string;
}
