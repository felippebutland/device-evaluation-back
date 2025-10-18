import {
    IsString,
    IsNotEmpty,
    IsArray,
    IsOptional,
    IsEnum,
    IsEmail,
    IsMongoId,
    MaxLength,
    ArrayMaxSize,
    IsUrl,
    ValidateIf, ValidateNested, IsNumber, Min
} from 'class-validator';
import {DeviceCondition} from "../../common/enums/device-condition.enum";
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {Type} from "class-transformer";

class ApplicableDamageTypeDto {
    @IsString()
    id!: string;

    @IsNumber()
    @Min(0)
    defaultDiscountPercentage!: number;
}

export class CreateDeviceSubmissionDto {
    @IsString()
    deviceId!: string;

    @ValidateIf(o => !o.userId)
    @IsString()
    @IsOptional()
    @MaxLength(100)
    contactName?: string;

    @IsOptional()
    @ValidateIf(o => !o.userId)
    @IsEmail()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    contactPhone?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    deviceSerialNumber!: string;

    @IsEnum(DeviceCondition)
    reportedCondition!: DeviceCondition;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    @ArrayMaxSize(5)
    deviceImages?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    userNotes?: string;

    @IsEnum(SaleMode)
    preferredSaleMode!: SaleMode;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApplicableDamageTypeDto)
    applicableDamageTypes!: ApplicableDamageTypeDto[];
}
