import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    MaxLength,
    IsEnum
} from 'class-validator';
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {PaymentTiming} from "../../common/enums/payment-timing.enum";

export class CreatePricingPolicyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsEnum(SaleMode)
    saleMode!: SaleMode;

    @IsEnum(PaymentTiming)
    paymentTiming!: PaymentTiming;

    @IsNumber()
    @Min(0)
    discountAmount!: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    priority?: number = 0;
}
