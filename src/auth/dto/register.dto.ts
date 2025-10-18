import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    password!: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole = UserRole.USER;
}