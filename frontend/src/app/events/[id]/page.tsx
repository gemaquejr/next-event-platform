import Link from 'next/link';
import { notFound } from 'next/navigation';

import { apiFetch } from '@/services/api';
import type { Event } from '@/types/event';

import styles from './page.module.css';

interface EventPageProps {
    params: Promise<{
        id: string;
    }>;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
        'pt-BR',
        {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        },
    );
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
        'pt-BR',
        {
            hour: '2-digit',
            minute: '2-digit',
        },
    );
}

function formatPrice(
    price: string | number,
) {
    return Number(price).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL',
        },
    );
}

export default async function EventPage({
    params,
}: EventPageProps) {
    const { id } = await params;

    let event: Event;

    try {
        event = await apiFetch<Event>(
            `/events/${id}`,
        );
    } catch {
        notFound();
    }

    if (event.status !== 'PUBLISHED') {
        notFound();
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <Link
                    href="/"
                    className={styles.back}
                >
                    ← Voltar para eventos
                </Link>

                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.type}>
                            {event.type === 'MOVIE'
                                ? 'Cinema'
                                : 'Show'}
                        </span>

                        <h1>{event.title}</h1>

                        {event.description && (
                            <p className={styles.description}>
                                {event.description}
                            </p>
                        )}
                    </div>
                </section>

                <section className={styles.content}>
                    <div className={styles.details}>
                        <div className={styles.detail}>
                            <span className={styles.label}>
                                Data
                            </span>

                            <strong>
                                {formatDate(
                                    event.startAt,
                                )}
                            </strong>
                        </div>

                        <div className={styles.detail}>
                            <span className={styles.label}>
                                Horário
                            </span>

                            <strong>
                                {formatTime(
                                    event.startAt,
                                )}

                                {event.endAt &&
                                    ` — ${formatTime(
                                        event.endAt,
                                    )}`}
                            </strong>
                        </div>

                        <div className={styles.detail}>
                            <span className={styles.label}>
                                Local
                            </span>

                            <strong>
                                {event.venue}
                            </strong>

                            {event.address && (
                                <span>
                                    {event.address}
                                </span>
                            )}
                        </div>

                        <div className={styles.detail}>
                            <span className={styles.label}>
                                Ingressos
                            </span>

                            <strong>
                                {event.capacity}
                            </strong>

                            <span>
                                lugares disponíveis
                            </span>
                        </div>
                    </div>

                    <aside className={styles.reservation}>
                        <span className={styles.label}>
                            A partir de
                        </span>

                        <strong className={styles.price}>
                            {formatPrice(
                                event.ticketPrice,
                            )}
                        </strong>

                        <p>
                            por ingresso
                        </p>

                        <Link
                            href={`/events/${event.id}/reserve`}
                            className={styles.reserveButton}
                        >
                            Reservar ingressos
                        </Link>
                    </aside>
                </section>
            </div>
        </main>
    );
}