import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(organizerId: string, createEventDto: CreateEventDto) {
        const {
            tmdbMovieId,
            startAt,
            endAt,
            ticketPrice,
            ...eventData
        } = createEventDto;

        return this.prisma.event.create({
            data: {
                ...eventData,
                organizerId,
                tmdbMovieId,
                startAt: new Date(startAt),
                endAt: endAt ? new Date(endAt) : undefined,
                ticketPrice,
            },
        });
    }

    async findAll() {
        return this.prisma.event.findMany({
            orderBy: {
                startAt: 'asc',
            },
        });
    }

    async findOne(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    async update(
        id: string,
        updateEventDto: UpdateEventDto,
    ) {
        await this.findOne(id);

        const {
            tmdbMovieId,
            startAt,
            endAt,
            ticketPrice,
            ...eventData
        } = updateEventDto;

        return this.prisma.event.update({
            where: { id },
            data: {
                ...eventData,
                tmdbMovieId,
                startAt: startAt ? new Date(startAt) : undefined,
                endAt: endAt ? new Date(endAt) : undefined,
                ticketPrice,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.event.delete({
            where: { id },
        });
    }

    async publish(id: string) {
        await this.findOne(id);

        return this.prisma.event.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
            },
        });
    }
}