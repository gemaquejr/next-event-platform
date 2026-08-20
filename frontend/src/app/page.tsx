import { EventCard } from '@/components/EventCard/EventCard';
import { apiFetch } from '@/services/api';
import type { Event } from '@/types/event';

import styles from './page.module.css';

export default async function Home() {
  let events: Event[] = [];
  let error = false;

  try {
    events = await apiFetch<Event[]>('/events');
  } catch {
    error = true;
  }

  const publishedEvents = events.filter(
    (event) => event.status === 'PUBLISHED',
  );

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>
            EVENT PLATFORM
          </span>

          <h1>
            Encontre seu próximo
            <span> evento.</span>
          </h1>

          <p>
            Descubra filmes, shows e experiências
            especiais perto de você.
          </p>

          <a
            href="#events"
            className={styles.heroButton}
          >
            Explorar eventos
          </a>
        </div>
      </section>

      <section
        id="events"
        className={styles.eventsSection}
      >
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionLabel}>
              AGENDA
            </span>

            <h2>
              Eventos disponíveis
            </h2>
          </div>

          <span className={styles.eventCount}>
            {publishedEvents.length}{' '}
            {publishedEvents.length === 1
              ? 'evento'
              : 'eventos'}
          </span>
        </div>

        {error ? (
          <div className={styles.message}>
            <h3>
              Não foi possível carregar
              os eventos.
            </h3>

            <p>
              Verifique se o servidor está
              disponível e tente novamente.
            </p>
          </div>
        ) : publishedEvents.length === 0 ? (
          <div className={styles.message}>
            <h3>
              Nenhum evento disponível.
            </h3>

            <p>
              Novos eventos serão publicados
              em breve.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {publishedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
