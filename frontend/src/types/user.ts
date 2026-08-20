import type { UserRole } from './event';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface LoginResponse {
    access_token: string;
}