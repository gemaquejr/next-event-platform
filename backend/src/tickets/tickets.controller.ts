import {
    Controller,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { UserRole } from '../../generated/prisma/enums';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
    constructor(
        private readonly ticketsService: TicketsService,
    ) { }

    @Post(':code/use')
    @Roles(UserRole.GATEKEEPER)
    use(
        @Param('code') code: string,
    ) {
        return this.ticketsService.use(code);
    }
}