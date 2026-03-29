import { IsString, IsNotEmpty, IsOptional, IsIn, IsBoolean, MaxLength } from 'class-validator';

export class CreateConservationStateDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsIn(['add', 'subtract'])
    operation?: 'add' | 'subtract' = 'subtract';

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}
