import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async use(code: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: {
                code,
            },
        });

        if (!ticket) {
            throw new NotFoundException(
                'Ticket not found',
            );
        }

        if (ticket.status === 'USED') {
            throw new BadRequestException(
                'Ticket has already been used',
            );
        }

        if (ticket.status === 'CANCELLED') {
            throw new BadRequestException(
                'Ticket is cancelled',
            );
        }

        return this.prisma.ticket.update({
            where: {
                id: ticket.id,
            },
            data: {
                status: 'USED',
                usedAt: new Date(),
            },
        });
    }
}