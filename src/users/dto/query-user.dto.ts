import {IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min} from 'class-validator';
import { Type } from 'class-transformer';
import {UserRole} from "../../common/enums/user-role.enum";

export class QueryUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}
