export type UserRole =
    | 'ORGANIZER'
    | 'CUSTOMER'
    | 'GATEKEEPER';

export type EventStatus =
    | 'DRAFT'
    | 'PUBLISHED'
    | 'CANCELLED'
    | 'FINISHED';

export type EventType =
    | 'MOVIE'
    | 'SHOW';

export interface Event {
    id: string;
    organizerId: string;
    tmdbMovieId?: number | null;
    title: string;
    description?: string | null;
    type: EventType;
    startAt: string;
    endAt?: string | null;
    venue: string;
    address?: string | null;
    capacity: number;
    ticketPrice: string | number;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
    slug: string;
}