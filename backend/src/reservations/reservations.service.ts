import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { randomUUID } from 'crypto';

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

    async confirm(
        id: string,
        customerId: string,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const reservation =
                await tx.reservation.findFirst({
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

            if (reservation.status !== 'PENDING') {
                throw new BadRequestException(
                    'Reservation cannot be confirmed',
                );
            }

            if (
                reservation.expiresAt &&
                reservation.expiresAt <= new Date()
            ) {
                throw new BadRequestException(
                    'Reservation has expired',
                );
            }

            const confirmedReservation =
                await tx.reservation.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        status: 'CONFIRMED',
                    },
                });

            await tx.ticket.createMany({
                data: Array.from(
                    { length: reservation.quantity },
                    () => ({
                        reservationId: reservation.id,
                        code: randomUUID(),
                        status: 'ACTIVE' as const,
                    }),
                ),
            });

            return tx.reservation.findUnique({
                where: {
                    id: confirmedReservation.id,
                },
                include: {
                    tickets: true,
                },
            });
        });
    }
}