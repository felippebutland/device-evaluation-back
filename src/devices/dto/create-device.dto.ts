import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsArray,
    IsOptional,
    Min,
    MaxLength,
    ArrayMaxSize,
    IsUrl,
    ValidateNested,
    IsEnum, IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import {PaymentTiming} from "../../common/enums/payment-timing.enum";
import {SaleMode} from "../../common/enums/sale-mode.enum";

class SpecificPricingPolicyDto {
    @IsEnum(SaleMode)
    saleMode?: SaleMode;

    @IsEnum(PaymentTiming)
    paymentTiming?: PaymentTiming;

    @IsNumber()
    @Min(0)
    discountAmount?: number;
}

class ApplicableDamageTypeDto {
    @IsString()
    id!: string;

    @IsNumber()
    @Min(0)
    defaultDiscountPercentage!: number;
}

export class DeviceVariantDto {
    @IsString()
    @IsNotEmpty()
    model!: string; // "Pro Max"

    @IsString()
    @IsNotEmpty()
    memory!: string; // "128GB"

    @IsNumber()
    @Min(0)
    price!: number; // 5000

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
    name!: string; // "iPhone 15"

    @IsString()
    @IsNotEmpty()
    brand!: string; // "Apple"

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    specifications?: string[];

    @IsOptional()
    @IsArray()
    images?: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeviceVariantDto)
    variants!: DeviceVariantDto[];

    @IsOptional()
    @IsArray()
    specificPricingPolicies?: Array<{
        saleMode: SaleMode;
        paymentTiming: PaymentTiming;
        discountAmount: number;
    }>;

    @IsOptional()
    @IsArray()
    applicableDamageTypes?: Array<any>;
}
