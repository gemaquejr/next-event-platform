import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../generated/prisma/enums';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ORGANIZER)
    create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() createEventDto: CreateEventDto,
    ) {
        return this.eventsService.create(
            user.id,
            createEventDto,
        );
    }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ORGANIZER)
    update(
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
    ) {
        return this.eventsService.update(
            id,
            updateEventDto,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ORGANIZER)
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }

    @Post(':id/publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ORGANIZER)
    publish(@Param('id') id: string) {
        return this.eventsService.publish(id);
    }
}