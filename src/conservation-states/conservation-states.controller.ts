import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConservationStatesService } from './conservation-states.service';
import { CreateConservationStateDto } from './dto/create-conservation-state.dto';
import { UpdateConservationStateDto } from './dto/update-conservation-state.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('conservation-states')
export class ConservationStatesController {
    constructor(private conservationStatesService: ConservationStatesService) {}

    @Public()
    @Get('public')
    findAllPublic() {
        return this.conservationStatesService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() dto: CreateConservationStateDto) {
        return this.conservationStatesService.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.conservationStatesService.findAllAdmin();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.conservationStatesService.findById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateConservationStateDto) {
        return this.conservationStatesService.update(id, dto);
    }

    @Patch(':id/toggle-active')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    toggleActiveStatus(@Param('id') id: string) {
        return this.conservationStatesService.toggleActiveStatus(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.conservationStatesService.delete(id);
    }
}
