'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { User } from '@/types/auth';

import styles from './Navbar.module.css';

function getStoredUser(): User | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedUser =
        localStorage.getItem('user');

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as User;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
}

export function Navbar() {
    const [user, setUser] =
        useState<User | null>(getStoredUser);

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        setUser(null);
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContent}>
                <Link
                    href="/"
                    className={styles.logo}
                >
                    EVENT PLATFORM
                </Link>

                {user ? (
                    <div className={styles.userArea}>
                        <span>
                            Olá, {user.name}
                        </span>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            Sair
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className={styles.loginButton}
                    >
                        Entrar
                    </Link>
                )}
            </div>
        </nav>
    );
}