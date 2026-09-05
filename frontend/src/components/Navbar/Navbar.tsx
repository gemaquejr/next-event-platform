'use client';

import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

import styles from './Navbar.module.css';

export function Navbar() {
    const { user, logout } = useAuth();

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
                            onClick={logout}
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