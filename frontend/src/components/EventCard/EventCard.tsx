import Link from 'next/link';

import type { Event } from '@/types/event';

import styles from './EventCard.module.css';

interface EventCardProps {
    event: Event;
}

export function EventCard({
    event,
}: EventCardProps) {
    const price = Number(event.ticketPrice);

    return (
        <article className={styles.card}>
            <div className={styles.type}>
                {event.type === 'MOVIE'
                    ? 'Cinema'
                    : 'Show'}
            </div>

            <div className={styles.content}>
                <h3>{event.title}</h3>

                {event.description && (
                    <p className={styles.description}>
                        {event.description}
                    </p>
                )}

                <div className={styles.info}>
                    <span>
                        {new Date(
                            event.startAt,
                        ).toLocaleDateString(
                            'pt-BR',
                            {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            },
                        )}
                    </span>

                    <span>{event.venue}</span>
                </div>

                <div className={styles.footer}>
                    <strong>
                        {price.toLocaleString(
                            'pt-BR',
                            {
                                style: 'currency',
                                currency: 'BRL',
                            },
                        )}
                    </strong>

                    <Link
                        href={`/ events / ${event.id} `}
                        className={styles.button}
                    >
                        Ver evento
                    </Link>
                </div>
            </div>
        </article>
    );
}
