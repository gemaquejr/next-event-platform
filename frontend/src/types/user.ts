import type { UserRole } from './auth';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}