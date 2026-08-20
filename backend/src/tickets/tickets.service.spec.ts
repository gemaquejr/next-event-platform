import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
    let service: TicketsService;

    let prismaService: {
        ticket: {
            findUnique: jest.Mock;
            update: jest.Mock;
        };
    };

    beforeEach(() => {
        prismaService = {
            ticket: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        service = new TicketsService(
            prismaService as unknown as PrismaService,
        );
    });

    describe('use', () => {
        it('should use an active ticket successfully', async () => {
            const ticket = {
                id: 'ticket-123',
                reservationId: 'reservation-123',
                code: 'ABC123',
                status: 'ACTIVE',
                usedAt: null,
            };

            const updatedTicket = {
                ...ticket,
                status: 'USED',
                usedAt: new Date(),
            };

            prismaService.ticket.findUnique.mockResolvedValue(
                ticket,
            );

            prismaService.ticket.update.mockResolvedValue(
                updatedTicket,
            );

            const result = await service.use('ABC123');

            expect(
                prismaService.ticket.findUnique,
            ).toHaveBeenCalledWith({
                where: {
                    code: 'ABC123',
                },
            });

            expect(
                prismaService.ticket.update,
            ).toHaveBeenCalledWith({
                where: {
                    id: 'ticket-123',
                },
                data: {
                    status: 'USED',
                    usedAt: expect.any(Date),
                },
            });

            expect(result).toEqual(updatedTicket);
        });

        it('should throw NotFoundException when ticket does not exist', async () => {
            prismaService.ticket.findUnique.mockResolvedValue(
                null,
            );

            await expect(
                service.use('INVALID'),
            ).rejects.toThrow(
                new NotFoundException('Ticket not found'),
            );

            expect(
                prismaService.ticket.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when ticket was already used', async () => {
            prismaService.ticket.findUnique.mockResolvedValue({
                id: 'ticket-123',
                code: 'ABC123',
                status: 'USED',
                usedAt: new Date(),
            });

            await expect(
                service.use('ABC123'),
            ).rejects.toThrow(
                new BadRequestException(
                    'Ticket has already been used',
                ),
            );

            expect(
                prismaService.ticket.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when ticket is cancelled', async () => {
            prismaService.ticket.findUnique.mockResolvedValue({
                id: 'ticket-123',
                code: 'ABC123',
                status: 'CANCELLED',
                usedAt: null,
            });

            await expect(
                service.use('ABC123'),
            ).rejects.toThrow(
                new BadRequestException(
                    'Ticket is cancelled',
                ),
            );

            expect(
                prismaService.ticket.update,
            ).not.toHaveBeenCalled();
        });
    });
});