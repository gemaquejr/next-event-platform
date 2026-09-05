'use client';

import {
    FormEvent,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            await login(email, password);

            router.push('/');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível realizar o login.',
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <Link
                    href="/"
                    className={styles.back}
                >
                    ← Voltar
                </Link>

                <div className={styles.header}>
                    <span className={styles.eyebrow}>
                        Event Platform
                    </span>

                    <h1>
                        Entrar
                    </h1>

                    <p>
                        Acesse sua conta para
                        continuar.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <label htmlFor="email">
                        E-mail
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="seu@email.com"
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="password">
                        Senha
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value,
                            )
                        }
                        placeholder="Sua senha"
                        autoComplete="current-password"
                        minLength={8}
                        required
                    />

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Entrando...'
                            : 'Entrar'}
                    </button>
                </form>
            </section>
        </main>
    );
}
