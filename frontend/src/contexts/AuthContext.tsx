'use client';

import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

import { apiFetch } from '@/services/api';

import type {
    LoginResponse,
    User,
} from '@/types/auth';

interface AuthContextValue {
    user: User | null;
    login: (
        email: string,
        password: string,
    ) => Promise<void>;
    logout: () => void;
}

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    );

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    async function login(
        email: string,
        password: string,
    ) {
        const response =
            await apiFetch<LoginResponse>(
                '/auth/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                },
            );

        localStorage.setItem(
            'accessToken',
            response.accessToken,
        );

        localStorage.setItem(
            'user',
            JSON.stringify(response.user),
        );

        setUser(response.user);
    }

    function logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used within an AuthProvider',
        );
    }

    return context;
}