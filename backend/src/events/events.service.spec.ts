import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from './events.service';

describe('EventsService', () => {
    let service: EventsService;

    const prismaService = {
        event: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();

        service = new EventsService(
            prismaService as unknown as PrismaService,
        );
    });

    describe('create', () => {
        it('should create an event successfully', async () => {
            const organizerId = 'organizer-id';

            const dto = {
                tmdbMovieId: 123,
                title: 'Cinema Teste',
                description: 'Evento de teste',
                type: 'MOVIE' as const,
                startAt: '2026-09-20T20:00:00.000Z',
                endAt: '2026-09-20T22:00:00.000Z',
                venue: 'Cinema Teste',
                address: 'São Paulo - SP',
                capacity: 100,
                ticketPrice: 35,
                slug: 'cinema-teste',
            };

            const createdEvent = {
                id: 'event-id',
                organizerId,
                ...dto,
            };

            prismaService.event.create.mockResolvedValue(createdEvent);

            const result = await service.create(
                organizerId,
                dto,
            );

            expect(prismaService.event.create).toHaveBeenCalledWith({
                data: {
                    tmdbMovieId: dto.tmdbMovieId,
                    title: dto.title,
                    description: dto.description,
                    type: dto.type,
                    startAt: new Date(dto.startAt),
                    endAt: new Date(dto.endAt),
                    venue: dto.venue,
                    address: dto.address,
                    capacity: dto.capacity,
                    ticketPrice: dto.ticketPrice,
                    slug: dto.slug,
                    organizerId,
                },
            });

            expect(result).toEqual(createdEvent);
        });
    });

    describe('findAll', () => {
        it('should return all events ordered by start date', async () => {
            const events = [
                {
                    id: 'event-1',
                    title: 'Event 1',
                    startAt: new Date('2026-09-20T20:00:00.000Z'),
                },
                {
                    id: 'event-2',
                    title: 'Event 2',
                    startAt: new Date('2026-10-20T20:00:00.000Z'),
                },
            ];

            prismaService.event.findMany.mockResolvedValue(events);

            const result = await service.findAll();

            expect(prismaService.event.findMany).toHaveBeenCalledWith({
                orderBy: {
                    startAt: 'asc',
                },
            });

            expect(result).toEqual(events);
        });
    });

    describe('findOne', () => {
        it('should return an event when it exists', async () => {
            const event = {
                id: 'event-id',
                title: 'Cinema Teste',
            };

            prismaService.event.findUnique.mockResolvedValue(event);

            const result = await service.findOne('event-id');

            expect(prismaService.event.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
            });

            expect(result).toEqual(event);
        });

        it('should throw NotFoundException when event does not exist', async () => {
            prismaService.event.findUnique.mockResolvedValue(null);

            await expect(
                service.findOne('non-existent-id'),
            ).rejects.toThrow(
                new NotFoundException('Event not found'),
            );
        });
    });

    describe('update', () => {
        it('should update an existing event', async () => {
            const existingEvent = {
                id: 'event-id',
                title: 'Old Title',
            };

            const dto = {
                title: 'New Title',
                startAt: '2026-10-20T20:00:00.000Z',
                ticketPrice: 45,
            };

            const updatedEvent = {
                ...existingEvent,
                ...dto,
            };

            prismaService.event.findUnique.mockResolvedValue(existingEvent);
            prismaService.event.update.mockResolvedValue(updatedEvent);

            const result = await service.update(
                'event-id',
                dto,
            );

            expect(prismaService.event.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
            });

            expect(prismaService.event.update).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
                data: {
                    title: 'New Title',
                    tmdbMovieId: undefined,
                    startAt: new Date(dto.startAt),
                    endAt: undefined,
                    ticketPrice: 45,
                },
            });

            expect(result).toEqual(updatedEvent);
        });

        it('should throw NotFoundException when updating a non-existent event', async () => {
            prismaService.event.findUnique.mockResolvedValue(null);

            await expect(
                service.update('non-existent-id', {
                    title: 'New Title',
                }),
            ).rejects.toThrow(
                new NotFoundException('Event not found'),
            );

            expect(prismaService.event.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove an existing event', async () => {
            const event = {
                id: 'event-id',
                title: 'Cinema Teste',
            };

            prismaService.event.findUnique.mockResolvedValue(event);
            prismaService.event.delete.mockResolvedValue(event);

            const result = await service.remove('event-id');

            expect(prismaService.event.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
            });

            expect(prismaService.event.delete).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
            });

            expect(result).toEqual(event);
        });

        it('should throw NotFoundException when removing a non-existent event', async () => {
            prismaService.event.findUnique.mockResolvedValue(null);

            await expect(
                service.remove('non-existent-id'),
            ).rejects.toThrow(
                new NotFoundException('Event not found'),
            );

            expect(prismaService.event.delete).not.toHaveBeenCalled();
        });
    });

    describe('publish', () => {
        it('should publish an existing event', async () => {
            const event = {
                id: 'event-id',
                title: 'Cinema Teste',
                status: 'DRAFT',
            };

            const publishedEvent = {
                ...event,
                status: 'PUBLISHED',
            };

            prismaService.event.findUnique.mockResolvedValue(event);
            prismaService.event.update.mockResolvedValue(publishedEvent);

            const result = await service.publish('event-id');

            expect(prismaService.event.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
            });

            expect(prismaService.event.update).toHaveBeenCalledWith({
                where: {
                    id: 'event-id',
                },
                data: {
                    status: 'PUBLISHED',
                },
            });

            expect(result).toEqual(publishedEvent);
        });

        it('should throw NotFoundException when publishing a non-existent event', async () => {
            prismaService.event.findUnique.mockResolvedValue(null);

            await expect(
                service.publish('non-existent-id'),
            ).rejects.toThrow(
                new NotFoundException('Event not found'),
            );

            expect(prismaService.event.update).not.toHaveBeenCalled();
        });
    });
});