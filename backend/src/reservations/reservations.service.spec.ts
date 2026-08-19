import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationsService', () => {
    let service: ReservationsService;

    let prismaService: {
        event: {
            findUnique: jest.Mock;
        };
        reservation: {
            create: jest.Mock;
            findMany: jest.Mock;
            findFirst: jest.Mock;
        };
    };

    beforeEach(() => {
        prismaService = {
            event: {
                findUnique: jest.fn(),
            },
            reservation: {
                create: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
            },
        };

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

            prismaService.event.findUnique.mockResolvedValue(
                publishedEvent,
            );

            prismaService.reservation.create.mockResolvedValue(
                reservation,
            );

            const result = await service.create(
                customerId,
                createReservationDto,
            );

            expect(
                prismaService.event.findUnique,
            ).toHaveBeenCalledWith({
                where: {
                    id: 'event-123',
                },
            });

            expect(
                prismaService.reservation.create,
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
            prismaService.event.findUnique.mockResolvedValue(
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
                prismaService.reservation.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when event is not published', async () => {
            prismaService.event.findUnique.mockResolvedValue({
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
                prismaService.reservation.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when quantity exceeds capacity', async () => {
            prismaService.event.findUnique.mockResolvedValue({
                ...publishedEvent,
                capacity: 1,
            });

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
                prismaService.reservation.create,
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