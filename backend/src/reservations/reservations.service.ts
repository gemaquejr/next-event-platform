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

        return this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
            SELECT id
            FROM events
            WHERE id = ${eventId}
            FOR UPDATE
        `;

            const event = await tx.event.findUnique({
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

            const now = new Date();

            const reservations = await tx.reservation.findMany({
                where: {
                    eventId,
                    OR: [
                        {
                            status: 'CONFIRMED',
                        },
                        {
                            status: 'PENDING',
                            OR: [
                                {
                                    expiresAt: null,
                                },
                                {
                                    expiresAt: {
                                        gt: now,
                                    },
                                },
                            ],
                        },
                    ],
                },
                select: {
                    quantity: true,
                },
            });

            const reservedQuantity = reservations.reduce(
                (total, reservation) =>
                    total + reservation.quantity,
                0,
            );

            const availableQuantity =
                event.capacity - reservedQuantity;

            if (quantity > availableQuantity) {
                throw new BadRequestException(
                    'Not enough tickets available',
                );
            }

            const totalAmount =
                Number(event.ticketPrice) * quantity;

            const expiresAt = new Date(
                Date.now() + 15 * 60 * 1000,
            );

            return tx.reservation.create({
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