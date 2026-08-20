import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationsService', () => {
    let service: ReservationsService;

    let prismaService: {
        $transaction: jest.Mock;
        event: {
            findUnique: jest.Mock;
        };
        reservation: {
            create: jest.Mock;
            findMany: jest.Mock;
            findFirst: jest.Mock;
        };
    };

    let transaction: {
        $queryRaw: jest.Mock;
        event: {
            findUnique: jest.Mock;
        };
        reservation: {
            findMany: jest.Mock;
            create: jest.Mock;
            findFirst: jest.Mock;
            update: jest.Mock;
            findUnique: jest.Mock;
        };
        ticket: {
            createMany: jest.Mock;
        };
    };

    beforeEach(() => {
        transaction = {
            $queryRaw: jest.fn(),
            event: {
                findUnique: jest.fn(),
            },
            reservation: {
                findMany: jest.fn(),
                create: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                findUnique: jest.fn(),
            },
            ticket: {
                createMany: jest.fn(),
            },
        };

        prismaService = {
            $transaction: jest.fn(),
            event: {
                findUnique: jest.fn(),
            },
            reservation: {
                create: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
            },
        };

        prismaService.$transaction.mockImplementation(
            async (callback) => callback(transaction),
        );

        service = new ReservationsService(
            prismaService as unknown as PrismaService,
        );
    });

    describe('create', () => {
        const customerId =
            'customer-123';

        const createReservationDto = {
            eventId: 'event-123',
            quantity: 2,
        };

        const publishedEvent = {
            id: 'event-123',
            title: 'Cinema Teste',
            status: 'PUBLISHED',
            capacity: 100,
            ticketPrice: 35,
        };

        it('should create a reservation successfully', async () => {
            const reservation = {
                id: 'reservation-123',
                customerId,
                eventId: 'event-123',
                quantity: 2,
                unitPrice: 35,
                totalAmount: 70,
                status: 'PENDING',
            };

            transaction.event.findUnique.mockResolvedValue(
                publishedEvent,
            );

            transaction.reservation.findMany.mockResolvedValue([]);

            transaction.reservation.create.mockResolvedValue(
                reservation,
            );

            const result = await service.create(
                customerId,
                createReservationDto,
            );

            expect(
                prismaService.$transaction,
            ).toHaveBeenCalledTimes(1);

            expect(
                transaction.$queryRaw,
            ).toHaveBeenCalled();

            expect(
                transaction.event.findUnique,
            ).toHaveBeenCalledWith({
                where: {
                    id: 'event-123',
                },
            });

            expect(
                transaction.reservation.findMany,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        eventId: 'event-123',
                    }),
                    select: {
                        quantity: true,
                    },
                }),
            );

            expect(
                transaction.reservation.create,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        customerId,
                        eventId: 'event-123',
                        quantity: 2,
                        unitPrice: 35,
                        totalAmount: 70,
                        status: 'PENDING',
                        expiresAt: expect.any(Date),
                    }),
                }),
            );

            expect(result).toEqual(reservation);
        });

        it('should throw NotFoundException when event does not exist', async () => {
            transaction.event.findUnique.mockResolvedValue(
                null,
            );

            await expect(
                service.create(
                    customerId,
                    createReservationDto,
                ),
            ).rejects.toThrow(
                new NotFoundException('Event not found'),
            );

            expect(
                transaction.reservation.findMany,
            ).not.toHaveBeenCalled();

            expect(
                transaction.reservation.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when event is not published', async () => {
            transaction.event.findUnique.mockResolvedValue({
                ...publishedEvent,
                status: 'DRAFT',
            });

            await expect(
                service.create(
                    customerId,
                    createReservationDto,
                ),
            ).rejects.toThrow(
                new BadRequestException(
                    'Event is not available for reservation',
                ),
            );

            expect(
                transaction.reservation.findMany,
            ).not.toHaveBeenCalled();

            expect(
                transaction.reservation.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when quantity exceeds available capacity', async () => {
            transaction.event.findUnique.mockResolvedValue(
                publishedEvent,
            );

            transaction.reservation.findMany.mockResolvedValue([
                {
                    quantity: 99,
                },
            ]);

            await expect(
                service.create(
                    customerId,
                    createReservationDto,
                ),
            ).rejects.toThrow(
                new BadRequestException(
                    'Not enough tickets available',
                ),
            );

            expect(
                transaction.reservation.create,
            ).not.toHaveBeenCalled();
        });
    });

    describe('confirm', () => {
        const customerId = 'customer-123';
        const reservationId = 'reservation-123';

        it('should confirm a pending reservation and create tickets', async () => {
            const reservation = {
                id: reservationId,
                customerId,
                eventId: 'event-123',
                quantity: 2,
                unitPrice: 35,
                totalAmount: 70,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            };

            const confirmedReservation = {
                ...reservation,
                status: 'CONFIRMED',
            };

            const tickets = [
                {
                    id: 'ticket-1',
                    reservationId,
                    code: 'ticket-code-1',
                    status: 'ACTIVE',
                },
                {
                    id: 'ticket-2',
                    reservationId,
                    code: 'ticket-code-2',
                    status: 'ACTIVE',
                },
            ];

            transaction.reservation.findFirst.mockResolvedValue(
                reservation,
            );

            transaction.reservation.update.mockResolvedValue(
                confirmedReservation,
            );

            transaction.ticket.createMany.mockResolvedValue({
                count: 2,
            });

            transaction.reservation.findUnique.mockResolvedValue({
                ...confirmedReservation,
                tickets,
            });

            const result = await service.confirm(
                reservationId,
                customerId,
            );

            expect(
                transaction.reservation.findFirst,
            ).toHaveBeenCalledWith({
                where: {
                    id: reservationId,
                    customerId,
                },
            });

            expect(
                transaction.reservation.update,
            ).toHaveBeenCalledWith({
                where: {
                    id: reservationId,
                },
                data: {
                    status: 'CONFIRMED',
                },
            });

            expect(
                transaction.ticket.createMany,
            ).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        reservationId,
                        status: 'ACTIVE',
                        code: expect.any(String),
                    }),
                    expect.objectContaining({
                        reservationId,
                        status: 'ACTIVE',
                        code: expect.any(String),
                    }),
                ]),
            });

            expect(
                transaction.ticket.createMany.mock.calls[0][0].data,
            ).toHaveLength(2);

            expect(
                transaction.reservation.findUnique,
            ).toHaveBeenCalledWith({
                where: {
                    id: reservationId,
                },
                include: {
                    tickets: true,
                },
            });

            expect(result).toEqual({
                ...confirmedReservation,
                tickets,
            });
        });

        it('should throw NotFoundException when reservation does not exist', async () => {
            transaction.reservation.findFirst.mockResolvedValue(
                null,
            );

            await expect(
                service.confirm(
                    reservationId,
                    customerId,
                ),
            ).rejects.toThrow(
                new NotFoundException(
                    'Reservation not found',
                ),
            );

            expect(
                transaction.reservation.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when reservation is not pending', async () => {
            transaction.reservation.findFirst.mockResolvedValue({
                id: reservationId,
                customerId,
                status: 'CONFIRMED',
                quantity: 2,
                expiresAt: new Date(
                    Date.now() + 10 * 60 * 1000,
                ),
            });

            await expect(
                service.confirm(
                    reservationId,
                    customerId,
                ),
            ).rejects.toThrow(
                new BadRequestException(
                    'Reservation cannot be confirmed',
                ),
            );

            expect(
                transaction.reservation.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when reservation has expired', async () => {
            transaction.reservation.findFirst.mockResolvedValue({
                id: reservationId,
                customerId,
                status: 'PENDING',
                quantity: 2,
                expiresAt: new Date(
                    Date.now() - 60 * 1000,
                ),
            });

            await expect(
                service.confirm(
                    reservationId,
                    customerId,
                ),
            ).rejects.toThrow(
                new BadRequestException(
                    'Reservation has expired',
                ),
            );

            expect(
                transaction.reservation.update,
            ).not.toHaveBeenCalled();
        });
    });

    describe('findAllByCustomer', () => {
        it('should return customer reservations ordered by creation date', async () => {
            const reservations = [
                {
                    id: 'reservation-2',
                    customerId: 'customer-123',
                    createdAt: new Date('2026-08-19T12:00:00Z'),
                },
                {
                    id: 'reservation-1',
                    customerId: 'customer-123',
                    createdAt: new Date('2026-08-18T12:00:00Z'),
                },
            ];

            prismaService.reservation.findMany.mockResolvedValue(
                reservations,
            );

            const result =
                await service.findAllByCustomer(
                    'customer-123',
                );

            expect(
                prismaService.reservation.findMany,
            ).toHaveBeenCalledWith({
                where: {
                    customerId: 'customer-123',
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            expect(result).toEqual(reservations);
        });
    });

    describe('findOne', () => {
        it('should return a reservation when it belongs to the customer', async () => {
            const reservation = {
                id: 'reservation-123',
                customerId: 'customer-123',
                eventId: 'event-123',
                quantity: 2,
                totalAmount: 70,
            };

            prismaService.reservation.findFirst.mockResolvedValue(
                reservation,
            );

            const result =
                await service.findOne(
                    'reservation-123',
                    'customer-123',
                );

            expect(
                prismaService.reservation.findFirst,
            ).toHaveBeenCalledWith({
                where: {
                    id: 'reservation-123',
                    customerId: 'customer-123',
                },
            });

            expect(result).toEqual(reservation);
        });

        it('should throw NotFoundException when reservation does not exist', async () => {
            prismaService.reservation.findFirst.mockResolvedValue(
                null,
            );

            await expect(
                service.findOne(
                    'reservation-123',
                    'customer-123',
                ),
            ).rejects.toThrow(
                new NotFoundException(
                    'Reservation not found',
                ),
            );
        });
    });
});