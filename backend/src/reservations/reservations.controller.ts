import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../../generated/prisma/enums';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
    constructor(
        private readonly reservationsService: ReservationsService,
    ) { }

    @Post()
    @Roles(UserRole.CUSTOMER)
    create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() createReservationDto: CreateReservationDto,
    ) {
        return this.reservationsService.create(
            user.id,
            createReservationDto,
        );
    }

    @Get()
    @Roles(UserRole.CUSTOMER)
    findAll(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.reservationsService.findAllByCustomer(
            user.id,
        );
    }

    @Get(':id')
    @Roles(UserRole.CUSTOMER)
    findOne(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.reservationsService.findOne(
            id,
            user.id,
        );
    }
}