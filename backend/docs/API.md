# Referência da API

Base URL local: `http://localhost:4000`  
Formato: JSON (`Content-Type: application/json` onde aplicável).  
Autenticação: cabeçalho `Authorization: Bearer <JWT>`.

## Perfis (`User.role`)

- `CLINIC_ADMIN` — administrador da clínica
- `DOCTOR` — médico
- `PATIENT` — paciente

---

## Rotas públicas

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/health` | `{ "ok": true }` |
| `GET` | `/clinics` | Lista de clínicas |
| `GET` | `/clinics/:id` | Detalhe da clínica; **404** se não existir |
| `POST` | `/auth/register` | Registo de **paciente** apenas. Corpo: `email`, `password` (mín. 6 caracteres), `name`, `clinicId` |
| `POST` | `/auth/login` | Corpo: `email`, `password` → `{ token, user }` |

---

## Autenticado (qualquer perfil)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/me` | Dados do utilizador logado (sem password) |

---

## Admin da clínica (`CLINIC_ADMIN`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/admin/clinic` | Clínica associada ao utilizador |
| `PATCH` | `/admin/clinic` | Atualizar `name` e/ou `city` |
| `POST` | `/admin/doctors` | Criar médico na mesma clínica: `email`, `password`, `name` |
| `GET` | `/admin/doctors` | Lista de médicos da clínica |
| `GET` | `/admin/patients` | Lista de pacientes da clínica |
| `GET` | `/appointments` | Consultas da clínica (admin) |
| `POST` | `/appointments` | Criar consulta (`patientId`, `doctorId`, `scheduledAt`, `notes?`) |

---

## Médico (`DOCTOR`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/doctor/me` | Perfil do médico |
| `GET` | `/doctor/patients` | Pacientes da mesma clínica |
| `GET` | `/appointments` | Consultas em que é o médico |
| `PATCH` | `/appointments/:id/confirm` | Confirmar consulta |
| `PATCH` | `/appointments/:id/cancel` | Cancelar (se for o médico da consulta) |

---

## Paciente (`PATIENT`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/patient/me` | Perfil do paciente |
| `GET` | `/patient/clinic` | Dados da clínica onde está registado |
| `GET` | `/appointments` | Consultas do paciente |
| `GET` | `/patient/appointments` | Lista as consultas do paciente (formato próprio; ver resposta) |

---

## Agendamentos — resumo

Estados: `SCHEDULED`, `CONFIRMED`, `CANCELLED`.

Objeto típico (camelCase): `id`, `clinicId`, `doctorId`, `patientId`, `scheduledAt`, `status`, `notes`, `createdAt`, `updatedAt`. A rota `GET /patient/appointments` pode expor campos em **snake_case** (`scheduled_at`, etc.) — alinhar consumidores em conformidade.

---

## Códigos HTTP frequentes

| Código | Situação |
|--------|----------|
| `200` | Sucesso com corpo |
| `201` | Criação (registo, médico) |
| `204` | — (não usado nas rotas atuais de forma explícita) |
| `400` | Validação (campos obrigatórios, formato) |
| `401` | Token ausente, inválido ou expirado; credenciais inválidas no login |
| `403` | Perfil não autorizado para a rota |
| `404` | Recurso não encontrado (clínica, utilizador) |
| `409` | Conflito (e-mail já registado) |
| `500` | Erro interno não tratado |

Corpo de erro típico: `{ "error": "mensagem" }`.

## Utilizadores do seed (exemplo)

| E-mail | Perfil | Palavra-passe (seed) |
|--------|--------|----------------------|
| `admin@clinica.com` | Admin | `senha123` |
| `medico@clinica.com` | Médico | `senha123` |
| `paciente@clinica.com` | Paciente | `senha123` |
| `outro.paciente@clinica.com` | Paciente | `senha123` |
| `medico.aurora@clinica.com` | Médico (outra clínica) | `senha123` |

Ver [`prisma/seed.js`](../prisma/seed.js).

---

## Referência rápida — todas as rotas

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| `GET` | `/health` | — | Saúde |
| `POST` | `/auth/register` | — | `email`, `password`, `name`, `clinicId` — apenas **PATIENT** |
| `POST` | `/auth/login` | — | `email`, `password` → `{ token, user }` |
| `GET` | `/me` | JWT | Perfil do utilizador |
| `GET` | `/clinicas` | — | Lista clínicas |
| `GET` | `/clinicas/:id` | — | Detalhe |
| `GET` | `/admin/clinic` | JWT + admin | Clínica do admin |
| `PATCH` | `/admin/clinic` | JWT + admin | `name`, `city` |
| `POST` | `/admin/doctors` | JWT + admin | Criar médico |
| `GET` | `/admin/doctors` | JWT + admin | Médicos da clínica |
| `GET` | `/admin/patients` | JWT + admin | Pacientes da clínica |
| `GET` | `/doctor/me` | JWT + médico | Perfil |
| `GET` | `/doctor/patients` | JWT + médico | Pacientes |
| `GET` | `/patient/me` | JWT + paciente | Perfil |
| `GET` | `/patient/clinic` | JWT + paciente | Clínica |
| `GET` | `/appointments` | JWT | Lista por perfil (ver secções acima) |
| `POST` | `/appointments` | JWT + admin | Criar agendamento |
| `PATCH` | `/appointments/:id/confirm` | JWT + médico | Confirmar |
| `PATCH` | `/appointments/:id/cancel` | JWT + admin ou médico | Cancelar |
| `GET` | `/patient/appointments` | JWT + paciente | Consultas do paciente |
