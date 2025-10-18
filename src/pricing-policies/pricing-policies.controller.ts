// src/pricing-policies/pricing-policies.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards
} from '@nestjs/common';
import { PricingPoliciesService } from './pricing-policies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {CreatePricingPolicyDto} from "./dto/create-pricing-policy.dto";
import {UpdatePricingPolicyDto} from "./dto/update-pricing-policy.dto";

@Controller('pricing-policies')
export class PricingPoliciesController {
    constructor(private pricingPoliciesService: PricingPoliciesService) {}

    // Rota pública para ver políticas de preço (sem valores)
    @Public()
    @Get('public')
    findAllPublic() {
        // Retorna apenas informações básicas para o usuário
        return this.pricingPoliciesService.getDefaultPolicies();
    }

    // Rotas administrativas
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() createDto: CreatePricingPolicyDto) {
        return this.pricingPoliciesService.create(createDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.pricingPoliciesService.findAllAdmin();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.pricingPoliciesService.findById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdatePricingPolicyDto
    ) {
        return this.pricingPoliciesService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.pricingPoliciesService.delete(id);
    }
}
