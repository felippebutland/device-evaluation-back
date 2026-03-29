// create-device.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsArray,
    IsOptional,
    IsIn,
    Min,
    ValidateNested,
    IsEnum,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentTiming } from '../../common/enums/payment-timing.enum';
import { SaleMode } from '../../common/enums/sale-mode.enum';

export class SpecificPricingPolicyDto {
    @IsOptional()
    @IsEnum(SaleMode)
    saleMode?: SaleMode;

    @IsEnum(PaymentTiming)
    @IsOptional()
    paymentTiming?: PaymentTiming;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    discountAmount?: number;
}

export class ApplicableDamageTypeDto {
    @IsString()
    id!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    defaultDiscountPercentage!: number;

    @IsOptional()
    @IsIn(['add', 'subtract'])
    operation?: 'add' | 'subtract' = 'subtract';

    @IsOptional()
    @IsBoolean()
    blocksSubmission?: boolean = false;
}

export class ApplicableConservationStateDto {
    @IsString()
    id!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    value!: number;

    @IsOptional()
    @IsIn(['add', 'subtract'])
    operation?: 'add' | 'subtract' = 'subtract';
}

export class DeviceVariantDto {
    @IsString()
    @IsNotEmpty()
    model!: string;

    @IsString()
    @IsNotEmpty()
    memory!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price!: number;

    @IsOptional()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CreateDeviceDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    brand!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeviceVariantDto)
    variants!: DeviceVariantDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpecificPricingPolicyDto)
    specificPricingPolicies?: SpecificPricingPolicyDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApplicableDamageTypeDto)
    applicableDamageTypes?: ApplicableDamageTypeDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApplicableConservationStateDto)
    applicableConservationStates?: ApplicableConservationStateDto[];
}