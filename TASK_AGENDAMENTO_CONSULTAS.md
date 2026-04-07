# Task — Agendamento de consultas (API)

**Sprint:** 1 | **Story Points:** 5 | **Prioridade:** High  
**Atribuição:** Dev (com review do Tech Lead)  
**Audit ref:** QA-DESAFIO-AGENDA-01  
**Branch sugerida:** `feature/agendamento-consultas`

## Contexto

A clínica precisa permitir que o **administrador** registe consultas entre **médicos** e **pacientes** da mesma unidade, que o **médico** confirme consultas futuras e que **admin ou médico** possam cancelar. Os **pacientes** devem conseguir consultar as suas consultas e ver a clínica associada.

## Escopo funcional

1. **Admin da clínica**
   - Criar agendamento com `patientId`, `doctorId`, `scheduledAt` (ISO 8601) e `notes` opcional.
   - Listar todas as consultas da sua clínica (com identificação de médico e paciente).
   - Listar pacientes da clínica (mantém comportamento esperado de gestão).
2. **Médico**
   - Listar as suas consultas na clínica.
   - Confirmar consulta (`CONFIRMED`) quando aplicável.
   - Cancelar consultas em que é o médico responsável.
3. **Paciente**
   - Ver as suas consultas (lista própria).
   - Continuar a aceder aos dados da clínica como hoje.

## Contratos HTTP (referência para testes)

| Método | Rota | Perfil |
|--------|------|--------|
| `GET` | `/appointments` | Autenticado (comportamento por perfil documentado na API) |
| `POST` | `/appointments` | Admin da clínica |
| `PATCH` | `/appointments/:id/confirm` | Médico |
| `PATCH` | `/appointments/:id/cancel` | Admin ou médico |
| `GET` | `/patient/appointments` | Paciente |

Estados: `SCHEDULED`, `CONFIRMED`, `CANCELLED`.

## Critérios de aceitação (QA)

- [ ] Apenas utilizadores autenticados acedem a rotas de consultas (exceto públicas já existentes).
- [ ] Admin só gere dados da **sua** clínica; médico e paciente só veem o que lhes compete por regra de negócio.
- [ ] Não é possível agendar com paciente ou médico inválidos (perfil errado).
- [ ] Datas e estados persistem corretamente na base de dados (incluindo após cancelamento e confirmação).
- [ ] Não há regressão nas rotas já existentes (`/admin/patients`, `/doctor/patients`, auth, clínicas públicas).
- [ ] Documentação de erros (4xx/5xx) e evidências (Postman/REST Client + verificação em BD quando necessário).

## Definition of Done

- [ ] Código na branch, revisão e testes manuais/automatizados descritos no relatório do QA.
- [ ] Critérios acima validados com evidências.

---

Documentação técnica da API: [`backend/docs/API.md`](backend/docs/API.md).
