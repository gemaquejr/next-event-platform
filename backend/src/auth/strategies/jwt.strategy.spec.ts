import { UnauthorizedException } from '@nestjs/common';

import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    const prismaService = {
        user: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.JWT_SECRET = 'test-secret';

        strategy = new JwtStrategy(
            prismaService as unknown as PrismaService,
        );
    });

    describe('validate', () => {
        it('should return the user when the payload is valid', async () => {
            const payload = {
                sub: 'user-id',
                email: 'customer@example.com',
                role: 'CUSTOMER',
            };

            const user = {
                id: 'user-id',
                name: 'Customer One',
                email: 'customer@example.com',
                role: 'CUSTOMER',
            };

            prismaService.user.findUnique.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result).toEqual(user);

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'user-id',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
        });

        it('should throw UnauthorizedException when user does not exist', async () => {
            const payload = {
                sub: 'user-id',
                email: 'customer@example.com',
                role: 'CUSTOMER',
            };

            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                strategy.validate(payload),
            ).rejects.toThrow(
                new UnauthorizedException('User not found'),
            );

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'user-id',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
        });
    });
});