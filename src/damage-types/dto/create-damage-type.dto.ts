import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsIn,
    IsBoolean,
    Min,
    Max,
    MaxLength
} from 'class-validator';

export class CreateDamageTypeDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    defaultDiscountPercentage?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    defaultDiscountAmount?: number;

    @IsOptional()
    @IsIn(['add', 'subtract'])
    operation?: 'add' | 'subtract' = 'subtract';

    @IsOptional()
    @IsBoolean()
    blocksSubmission?: boolean = false;

    @IsOptional()
    @IsNumber()
    @Min(0)
    priority?: number = 0;
}
