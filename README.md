# Event Platform

Plataforma de eventos e ingressos desenvolvida como teste técnico, com autenticação, controle de acesso por perfil, gerenciamento de eventos, reservas e validação de ingressos.

## Status

Em desenvolvimento.

O backend possui os principais fluxos de negócio implementados e testados. O frontend está em desenvolvimento.

## Stack

### Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* Passport
* Jest

### Frontend

* Next.js
* React
* TypeScript

### Infraestrutura

* PostgreSQL
* Node.js
* npm

## Arquitetura

O projeto utiliza uma arquitetura modular no backend, separando responsabilidades por domínio:

```text
backend/
├── auth/
├── events/
├── reservations/
├── tickets/
├── tmdb/
├── prisma/
└── database/
```

Os principais módulos são:

* **Auth** — autenticação e autorização.
* **Events** — criação, atualização, publicação e consulta de eventos.
* **Reservations** — criação e confirmação de reservas.
* **Tickets** — geração e validação de ingressos.
* **TMDB** — integração com dados de filmes.
* **Prisma** — acesso ao banco de dados.

## Perfis de usuário

A aplicação possui três perfis:

| Perfil       | Responsabilidades                                     |
| ------------ | ----------------------------------------------------- |
| `ORGANIZER`  | Criar, editar, publicar e gerenciar eventos           |
| `CUSTOMER`   | Consultar eventos, criar reservas e confirmar compras |
| `GATEKEEPER` | Validar ingressos na entrada dos eventos              |

O acesso aos endpoints protegidos é controlado por JWT e pelo sistema de roles.

## Fluxo principal

O fluxo de compra e utilização de ingressos funciona da seguinte forma:

```text
ORGANIZER
    │
    ├── Cria evento
    │       └── DRAFT
    │
    └── Publica evento
            └── PUBLISHED
                    │
                    ▼
CUSTOMER
    │
    ├── Consulta eventos
    │
    ├── Cria reserva
    │       └── PENDING
    │
    └── Confirma reserva
            ├── CONFIRMED
            └── Tickets gerados
                    │
                    ▼
GATEKEEPER
    │
    └── Valida ticket
            └── USED
```

As reservas pendentes possuem prazo de expiração de 15 minutos.

## Modelos principais

### User

Representa os usuários da plataforma.

Principais campos:

* `id`
* `name`
* `email`
* `passwordHash`
* `role`
* `createdAt`
* `updatedAt`

### Event

Representa os eventos disponíveis na plataforma.

Principais campos:

* `id`
* `organizerId`
* `tmdbMovieId`
* `title`
* `description`
* `type`
* `startAt`
* `endAt`
* `venue`
* `address`
* `capacity`
* `ticketPrice`
* `status`
* `slug`

### Reservation

Representa uma reserva realizada por um cliente.

Principais campos:

* `id`
* `customerId`
* `eventId`
* `quantity`
* `unitPrice`
* `totalAmount`
* `status`
* `expiresAt`
* `createdAt`
* `updatedAt`

### Ticket

Representa o ingresso gerado após a confirmação de uma reserva.

Principais campos:

* `id`
* `reservationId`
* `code`
* `status`
* `usedAt`
* `createdAt`

## Status

### Eventos

```text
DRAFT
PUBLISHED
CANCELLED
FINISHED
```

### Reservas

```text
PENDING
CONFIRMED
CANCELLED
EXPIRED
```

### Tickets

```text
ACTIVE
USED
CANCELLED
```

## API

A API utiliza JSON e autenticação baseada em JWT.

### Autenticação

#### Login

```http
POST /auth/login
```

Exemplo:

```json
{
  "email": "usuario@example.com",
  "password": "senha"
}
```

#### Usuário autenticado

```http
GET /auth/me
Authorization: Bearer <token>
```

## Eventos

### Listar eventos

```http
GET /events
```

Endpoint público.

### Consultar evento

```http
GET /events/:id
```

Endpoint público.

### Criar evento

```http
POST /events
Authorization: Bearer <organizer-token>
```

Requer:

```text
ORGANIZER
```

Exemplo:

```json
{
  "tmdbMovieId": 123,
  "title": "Cinema Teste",
  "description": "Evento de teste",
  "type": "MOVIE",
  "startAt": "2026-09-20T20:00:00.000Z",
  "endAt": "2026-09-20T22:00:00.000Z",
  "venue": "Cinema Teste",
  "address": "São Paulo - SP",
  "capacity": 100,
  "ticketPrice": 35,
  "slug": "cinema-teste"
}
```

### Atualizar evento

```http
PATCH /events/:id
Authorization: Bearer <organizer-token>
```

Requer:

```text
ORGANIZER
```

### Publicar evento

```http
POST /events/:id/publish
Authorization: Bearer <organizer-token>
```

Requer:

```text
ORGANIZER
```

### Remover evento

```http
DELETE /events/:id
Authorization: Bearer <organizer-token>
```

Requer:

```text
ORGANIZER
```

## Reservas

Todos os endpoints de reservas exigem:

```text
CUSTOMER
```

### Criar reserva

```http
POST /reservations
Authorization: Bearer <customer-token>
```

Exemplo:

```json
{
  "eventId": "event-id",
  "quantity": 2
}
```

A reserva é criada com status `PENDING` e expira após 15 minutos.

### Listar minhas reservas

```http
GET /reservations
Authorization: Bearer <customer-token>
```

### Consultar reserva

```http
GET /reservations/:id
Authorization: Bearer <customer-token>
```

### Confirmar reserva

```http
POST /reservations/:id/confirm
Authorization: Bearer <customer-token>
```

Após a confirmação:

```text
PENDING
   ↓
CONFIRMED
   ↓
Tickets gerados
```

A quantidade de tickets gerados corresponde à quantidade de ingressos da reserva.

## Tickets

A validação de ingressos exige:

```text
GATEKEEPER
```

### Validar ingresso

```http
POST /tickets/:code/use
Authorization: Bearer <gatekeeper-token>
```

Um ticket válido passa de:

```text
ACTIVE → USED
```

Um ticket já utilizado não pode ser utilizado novamente.

Tickets cancelados também não podem ser utilizados.

## Banco de dados

O projeto utiliza PostgreSQL com Prisma ORM.

Principais relacionamentos:

```text
User
 │
 ├─────────────── Event
 │                  │
 │                  └──── Reservation
 │                           │
 │                           └──── Ticket
 │
 └─────────────── Reservation
```

O banco possui constraints e índices para preservar a integridade dos dados e melhorar as consultas mais utilizadas.

Entre as principais constraints estão:

* Email de usuário único.
* Slug de evento único.
* Código de ticket único.
* Chaves estrangeiras entre entidades relacionadas.

Valores monetários são armazenados utilizando `Decimal(10,2)`.

## Concorrência

A criação de reservas utiliza transação de banco de dados e bloqueio da linha do evento durante a verificação de capacidade.

Isso evita que reservas simultâneas ultrapassem a capacidade disponível do evento.

O fluxo de confirmação de reservas e utilização de tickets também utiliza transações e validações de estado para preservar a integridade das operações.

## Tratamento de erros

A API utiliza exceções HTTP apropriadas para diferentes situações.

Exemplos:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
```

Um exemplo é a criação de dois eventos com o mesmo `slug`, que retorna:

```text
409 Conflict
```

com a mensagem:

```text
An event with this slug already exists
```

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret"
TMDB_API_KEY="your-tmdb-api-key"
```

Não versionar o arquivo `.env`.

Utilize `.env.example` para documentar as variáveis necessárias sem expor credenciais.

## Instalação

Clone o projeto:

```bash
git clone <repository-url>
cd next-event-platform
```

Instale as dependências do backend:

```bash
cd backend
npm install
```

Configure as variáveis de ambiente.

Gere o Prisma Client:

```bash
npx prisma generate
```

Execute as migrations:

```bash
npx prisma migrate dev
```

## Executando o backend

Modo desenvolvimento:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

Execução em produção:

```bash
npm run start:prod
```

## Testes

Executar todos os testes:

```bash
npm test
```

Executar os testes em modo sequencial:

```bash
npm test -- --runInBand
```

Executar um teste específico:

```bash
npx jest src/reservations/reservations.service.spec.ts
```

Executar os testes de tickets:

```bash
npx jest src/tickets/tickets.service.spec.ts
```

## Cobertura atual de testes

Os principais serviços possuem testes unitários cobrindo:

* criação de eventos;
* consulta de eventos;
* atualização de eventos;
* publicação de eventos;
* remoção de eventos;
* tratamento de slug duplicado;
* criação de reservas;
* validação de capacidade;
* expiração de reservas;
* confirmação de reservas;
* geração de tickets;
* validação de tickets;
* tickets já utilizados;
* tickets cancelados;
* autenticação;
* estratégia JWT;
* controle de acesso por roles.

## Desenvolvimento

Backend:

```bash
cd backend
npm run start:dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Próximos passos

* Finalizar frontend em Next.js.
* Implementar dashboards específicos para cada perfil.
* Integrar o fluxo de reservas e tickets ao frontend.
* Melhorar documentação da API.
* Preparar ambiente de produção.
* Configurar deploy da aplicação e banco de dados.

## Licença

Projeto desenvolvido para fins de teste técnico e demonstração de conhecimentos em desenvolvimento full stack.
