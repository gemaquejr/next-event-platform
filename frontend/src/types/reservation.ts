export type ReservationStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'EXPIRED';

export type TicketStatus =
    | 'ACTIVE'
    | 'USED'
    | 'CANCELLED';

export interface Ticket {
    id: string;
    reservationId: string;
    code: string;
    status: TicketStatus;
    usedAt?: string | null;
    createdAt: string;
}

export interface Reservation {
    id: string;
    customerId: string;
    eventId: string;
    quantity: number;
    unitPrice: string | number;
    totalAmount: string | number;
    status: ReservationStatus;
    expiresAt?: string | null;
    createdAt: string;
    updatedAt: string;
    tickets?: Ticket[];
}