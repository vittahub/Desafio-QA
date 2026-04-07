# Configuração e execução

## Pré-requisitos

- Node.js LTS (18+)
- PostgreSQL acessível (recomendado: Docker Compose na pasta **`desafio-qa`** — raiz deste repositório de desafio —, porta **5433** no host)

## 1. PostgreSQL (Docker)

Na pasta **`desafio-qa`** (onde está o `docker-compose.yml`):

```bash
docker compose up -d
```

O Postgres fica exposto em **`localhost:5433`**. Confirme com `docker compose ps`.

## 2. Backend

```bash
cd backend
copy .env.example .env
```

Em Unix/macOS: `cp .env.example .env`.

Depois:

```bash
npm install
npx prisma db push
npm run db:seed
npm start
```

### Utilizadores de exemplo (seed)

Palavra-passe comum: **`senha123`**.

| E-mail | Perfil |
|--------|--------|
| `admin@clinica.com` | Admin da clínica |
| `medico@clinica.com` | Médico |
| `paciente@clinica.com` | Paciente |
| `outro.paciente@clinica.com` | Paciente (mesma clínica) |
| `medico.aurora@clinica.com` | Médico (Clínica Aurora) |

## Variáveis de ambiente

Copie `.env.example` para `.env` na pasta `backend` (se ainda não o fez):

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de ligação PostgreSQL (ex.: `postgresql://user:pass@localhost:5433/desafio_qa?schema=public`) |
| `JWT_SECRET` | Segredo para assinar tokens JWT (obrigatório em produção) |
| `PORT` | Opcional; por defeito **4000** |

## Base de dados (comandos úteis na pasta `backend`)

```bash
npx prisma db push
npm run db:seed
```

- **Reset completo** (apaga dados e recria schema + seed): `npm run db:reset`

## Executar a API

Na pasta `backend`:

```bash
npm start
```

Servidor em `http://localhost:4000` (ou `PORT` definido no `.env`).

## Testes automatizados

Requer Postgres acessível com o mesmo `DATABASE_URL` do `.env`.

```bash
npm test
```

Os testes de integração limpam e recriam dados de teste no `beforeAll` (truncam `Clinic` em cascade). Use uma base de desenvolvimento, não produção.

## Problemas comuns

- **P1000 / P1001 (Prisma):** credenciais ou porta erradas; confirme que o container está em `docker compose ps` e que a porta no `.env` coincide (ex.: **5433**).
- **EPERM no Windows ao gerar o Prisma Client:** feche processos que bloqueiem `node_modules\.prisma` e execute `npx prisma generate` de novo.
