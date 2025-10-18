import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import {EvaluationStatus} from "../../common/enums/evaluation-status.enum";

export class QuerySubmissionDto {
    @IsOptional()
    @IsEnum(EvaluationStatus)
    status?: EvaluationStatus;

    @IsOptional()
    @IsString()
    deviceId?: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    trackingCode?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    contactEmail?: string;
}
