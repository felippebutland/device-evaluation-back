import {IsEnum, IsOptional, IsString, MaxLength} from "class-validator";
import {EvaluationStatus} from "../../common/enums/evaluation-status.enum";

export class UpdateSubmissionStatusDto {
    @IsEnum(EvaluationStatus)
    status?: EvaluationStatus;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}
