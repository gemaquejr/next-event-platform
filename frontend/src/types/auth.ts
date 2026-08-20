export type UserRole =
    | 'ORGANIZER'
    | 'CUSTOMER'
    | 'GATEKEEPER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}