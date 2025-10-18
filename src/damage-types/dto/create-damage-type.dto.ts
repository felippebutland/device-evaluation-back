import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
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
    @IsNumber()
    @Min(0)
    priority?: number = 0;
}
