import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
}

const pool = new Pool({
    connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log('🌱 Starting database seed...');

    const passwordHash = await bcrypt.hash('Organizer123!', 10);

    const organizer = await prisma.user.upsert({
        where: {
            email: 'organizer@example.com',
        },
        update: {},
        create: {
            name: 'Event Organizer',
            email: 'organizer@example.com',
            passwordHash,
            role: 'ORGANIZER',
        },
    });

    const customerPasswordHash = await bcrypt.hash('Customer123!', 10);

    const customer1 = await prisma.user.upsert({
        where: {
            email: 'customer1@example.com',
        },
        update: {},
        create: {
            name: 'Customer One',
            email: 'customer1@example.com',
            passwordHash: customerPasswordHash,
            role: 'CUSTOMER',
        },
    });

    const customer2 = await prisma.user.upsert({
        where: {
            email: 'customer2@example.com',
        },
        update: {},
        create: {
            name: 'Customer Two',
            email: 'customer2@example.com',
            passwordHash: customerPasswordHash,
            role: 'CUSTOMER',
        },
    });

    const gatekeeperPasswordHash = await bcrypt.hash(
        'Gatekeeper123!',
        10,
    );

    const gatekeeper = await prisma.user.upsert({
        where: {
            email: 'gatekeeper@example.com',
        },
        update: {},
        create: {
            name: 'Event Gatekeeper',
            email: 'gatekeeper@example.com',
            passwordHash: gatekeeperPasswordHash,
            role: 'GATEKEEPER',
        },
    });

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 30);
    eventDate.setHours(20, 0, 0, 0);

    const event = await prisma.event.upsert({
        where: {
            slug: 'cinema-teste-o-filme',
        },
        update: {},
        create: {
            organizerId: organizer.id,
            title: 'Cinema Teste — O Filme',
            slug: 'cinema-teste-o-filme',
            description: 'Evento criado automaticamente para demonstração.',
            type: 'MOVIE',
            startAt: eventDate,
            endAt: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
            venue: 'Cinema Teste',
            address: 'São Paulo - SP',
            capacity: 100,
            ticketPrice: 35.0,
            status: 'PUBLISHED',
        },
    });

    console.log('✅ Seed completed successfully.');
    console.log(`👤 Organizer: ${organizer.email}`);
    console.log(`👤 Customer 1: ${customer1.email}`);
    console.log(`👤 Customer 2: ${customer2.email}`);
    console.log(`🚪 Gatekeeper: ${gatekeeper.email}`);
    console.log(`🎬 Event: ${event.title}`);
}

main()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });