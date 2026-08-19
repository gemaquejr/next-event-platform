import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        customerId: string,
        createReservationDto: CreateReservationDto,
    ) {
        const {
            eventId,
            quantity,
        } = createReservationDto;

        const event = await this.prisma.event.findUnique({
            where: {
                id: eventId,
            },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (event.status !== 'PUBLISHED') {
            throw new BadRequestException(
                'Event is not available for reservation',
            );
        }

        if (quantity > event.capacity) {
            throw new BadRequestException(
                'Not enough tickets available',
            );
        }

        const totalAmount =
            Number(event.ticketPrice) * quantity;

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000,
        );

        return this.prisma.reservation.create({
            data: {
                customerId,
                eventId,
                quantity,
                unitPrice: event.ticketPrice,
                totalAmount,
                status: 'PENDING',
                expiresAt,
            },
        });
    }

    async findAllByCustomer(customerId: string) {
        return this.prisma.reservation.findMany({
            where: {
                customerId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(
        id: string,
        customerId: string,
    ) {
        const reservation =
            await this.prisma.reservation.findFirst({
                where: {
                    id,
                    customerId,
                },
            });

        if (!reservation) {
            throw new NotFoundException(
                'Reservation not found',
            );
        }

        return reservation;
    }
}