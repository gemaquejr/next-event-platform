import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;

    let prismaService: {
        user: {
            findUnique: jest.Mock;
        };
    };

    let jwtService: {
        signAsync: jest.Mock;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        prismaService = {
            user: {
                findUnique: jest.fn(),
            },
        };

        jwtService = {
            signAsync: jest.fn(),
        };

        authService = new AuthService(
            prismaService as unknown as PrismaService,
            jwtService as unknown as JwtService,
        );
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const user = {
                id: 'user-id',
                name: 'Customer One',
                email: 'customer1@example.com',
                passwordHash: 'hashed-password',
                role: 'CUSTOMER',
            };

            prismaService.user.findUnique.mockResolvedValue(user);

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            jwtService.signAsync.mockResolvedValue('fake-jwt-token');

            const result = await authService.login({
                email: 'customer1@example.com',
                password: 'correct-password',
            });

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: {
                    email: 'customer1@example.com',
                },
            });

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'correct-password',
                'hashed-password',
            );

            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: 'user-id',
                email: 'customer1@example.com',
                role: 'CUSTOMER',
            });

            expect(result).toEqual({
                accessToken: 'fake-jwt-token',
                user: {
                    id: 'user-id',
                    name: 'Customer One',
                    email: 'customer1@example.com',
                    role: 'CUSTOMER',
                },
            });
        });

        it('should throw UnauthorizedException when user does not exist', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.login({
                    email: 'unknown@example.com',
                    password: 'password',
                }),
            ).rejects.toThrow(
                new UnauthorizedException('Invalid credentials'),
            );

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: {
                    email: 'unknown@example.com',
                },
            });

            expect(jwtService.signAsync).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            const user = {
                id: 'user-id',
                name: 'Customer One',
                email: 'customer1@example.com',
                passwordHash: 'hashed-password',
                role: 'CUSTOMER',
            };

            prismaService.user.findUnique.mockResolvedValue(user);

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login({
                    email: 'customer1@example.com',
                    password: 'wrong-password',
                }),
            ).rejects.toThrow(
                new UnauthorizedException('Invalid credentials'),
            );

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'wrong-password',
                'hashed-password',
            );

            expect(jwtService.signAsync).not.toHaveBeenCalled();
        });
    });
});