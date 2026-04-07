# Processo seletivo — QA (automação / qualidade)

Bem-vindo(a). Este repositório contém o **desafio prático** da fase de **QA**: uma API de backend com cenário de clínica (utilizadores por perfil e clínicas).

A funcionalidade a avaliar está na branch **`feature/agendamento-consultas`** (**UltraBranch**). O enunciado da sprint está em [**TASK_AGENDAMENTO_CONSULTAS.md**](TASK_AGENDAMENTO_CONSULTAS.md).

---

## O trabalho do QA neste processo seletivo

O candidato **não** entrega código da feature. O objetivo é **testar** o que está na UltraBranch e **produzir documentação** (relatório) sobre essa task.

| Etapa | O que fazer |
|--------|----------------|
| **1. Ler a task** | Abrir [**TASK_AGENDAMENTO_CONSULTAS.md**](TASK_AGENDAMENTO_CONSULTAS.md): contexto, escopo, rotas a cobrir e **critérios de aceitação**. Isso define o âmbito do teu trabalho. |
| **2. Preparar o ambiente** | Checkout da **`feature/agendamento-consultas`**, PostgreSQL (ex.: Docker), `.env` e comandos em [**SETUP.md**](backend/docs/SETUP.md) (`prisma db push`, seed, arranque do servidor). Sem ambiente a correr, não há testes válidos. |
| **3. Executar os testes** | Explorar a API (Postman, Insomnia, REST Client, `curl`, etc.) contra os contratos da task. Cobrir perfis (admin, médico, paciente), HTTP 4xx/5xx, e **persistência** na base quando fizer sentido. |
| **4. Documentar (entrega principal)** | Redigir um **relatório / documentação** sobre a task: cenários (incluindo negativos), resultados, **evidências** (ex.: pedido, resposta, estado na BD), falhas ou lacunas face aos critérios de aceitação, e conclusões. Este documento é a **prova do teu trabalho de QA** no processo seletivo. |
| **5. Enviar o relatório** | Exporta o relatório final em **PDF** (único formato aceite) e **envia-o por e-mail** para a VittaHub: [**vittahuboficial@gmail.com**](mailto:vittahuboficial@gmail.com). Sem esta entrega no e-mail indicado, o desafio não é considerado recebido. |

**Em resumo:** o processo avalia **como testas e como comunicas** — o artefacto central é a **documentação em PDF** sobre a task, alinhada com o enunciado e com evidências, **submetida ao e-mail da VittaHub acima**.

---

## O que a documentação deve deixar claro (mínimo)

- Inventário de cenários relevantes (matriz ou lista estruturada).
- Comportamentos observados vs. esperado segundo a task e [**API.md**](backend/docs/API.md) (na UltraBranch).
- Erros, inconsistências ou riscos encontrados, com **evidências rastreáveis**.
- Nota sobre **regressões** em rotas já existentes, se aplicável (a task pede isso).

O nível de detalhe e a clareza contam tanto como a quantidade de bugs encontrados.

---

## Entrega do relatório (obrigatório)

Envia **por e-mail** um **único anexo em formato PDF** com o teu trabalho de QA para:

**[vittahuboficial@gmail.com](mailto:vittahuboficial@gmail.com)**

Indica no assunto algo identificável (ex.: processo seletivo QA — relatório — o teu nome). Podes redigir o relatório no Word, Google Docs ou Markdown e **exportar para PDF** antes de anexar.

---

## Fluxo interno (equipa)

1. **Dev** — Implementa na branch `feature/agendamento-consultas`.
2. **QA (candidato)** — Testa a UltraBranch, produz o relatório em **PDF** e **envia-o para [vittahuboficial@gmail.com](mailto:vittahuboficial@gmail.com)**.

---

## Links essenciais

| O quê | Onde |
|--------|------|
| **Task (enunciado e critérios de aceitação)** | [**TASK_AGENDAMENTO_CONSULTAS.md**](TASK_AGENDAMENTO_CONSULTAS.md) |
| Referência da API (rotas, perfis, códigos) | [**backend/docs/API.md**](backend/docs/API.md) |
| Ambiente, Docker, Prisma | [**backend/docs/SETUP.md**](backend/docs/SETUP.md) |
| Arquitetura e modelo de dados (resumo) | [**backend/docs/ARQUITETURA.md**](backend/docs/ARQUITETURA.md) |

Usa a documentação em **`backend/docs/`** da branch **`feature/agendamento-consultas`** enquanto testas.
