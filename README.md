# 🧠 Clone Bitrix24 - Focado em Gestão de pequenos negocios

> **Versão técnica e narrativa de desenvolvimento**
>
> Desenvolvido com excelência, foco em escalabilidade e uma arquitetura robusta, o GestOffice é mais do que um CRM — é a ponte entre a contabilidade moderna e a gestão digital de clientes, tarefas e equipas.

---

## 🚀 Visão Geral

**Clone Bitrix24** é uma aplicação web construída com tecnologias modernas como **Next.js**, **Tailwind CSS** e **TypeScript**, focada na **gestão inteligente de clientes, tarefas e empregados** para gabinetes de contabilidade.

- 🔒 **Sem vendas, sem confusões** – foco exclusivo na gestão de dados sensíveis de clientes
- 🧑‍💼 **3 níveis de acesso**: Empregado, Supervisor e Administrador
- 💼 **Fichas de Cliente inteligentes**: Com alertas de acesso simultâneo
- 🗂️ **Gestão de documentos por Blob Storage** e dados centralizados no Supabase
- 📅 **Tarefas e calendário integrados com Kanban**
- 💬 **Chat interno e gestão de ponto**
- ⚙️ **Sistema de permissões e controle de acesso refinado**

---

## 🏗️ Tecnologias Utilizadas

| Stack | Detalhes |
|-------|----------|
| 💻 Frontend | **Next.js App Router**, Tailwind CSS, shadcn/ui |
| 🔒 Autenticação | Supabase Auth |
| 📦 Base de dados | Supabase (PostgreSQL) |
| ☁️ Armazenamento | Supabase Blob Storage (Ficheiros de cliente) |
| 💬 Chat (simulado) | Interface construída com base em estados locais |
| ⚙️ Server Actions | Para todos os formulários, com revalidação |
| 🧪 TypeScript | Estruturação forte com tipos e interfaces |
| 🌙 Temas | Alternância entre Light, Dark e System com `next-themes` |

---

## 🛣️ Linha do Tempo do Desenvolvimento

### ✅ 1. Estrutura Inicial & Gestão de Clientes
- 🧱 Layout com Sidebar e Header fixos
- 📋 CRUD de Clientes com fichas detalhadas
- 🗂️ Separação dos dados por guias: **Geral**, **Contactos**, **Senhas**, **Ficheiros**
- 📁 Cada novo cliente cria uma **pasta própria no Blob Storage**

### ✅ 2. Gestão de Empregados & Permissões
- 👥 CRUD completo de empregados com papéis definidos: Admin, Supervisor, Empregado
- 🛂 Sistema de permissões refinado com interface visual
- 🔐 Políticas de acesso por rota e ação

### ✅ 3. Tarefas, Projetos e Calendário
- 📌 CRUD de tarefas e projetos com atribuições e prioridades
- 🗓️ Filtro por datas, projeto e responsável
- 🧩 Visualização por **lista ou Kanban** interativo (sem DnD inicialmente)

### ✅ 4. Chat & Ponto
- 💬 Interface de chat com lista de empregados e status (Simulado)
- 🕒 Sistema de ponto com entrada/saída e filtros por período
- 👨‍💼 Supervisores veem relatórios da equipa

### ✅ 5. Fichas Detalhadas & Integração Visual
- 🧾 Cada entidade (cliente, tarefa, projeto) tem página própria
- 🔍 Exibição de detalhes + atalhos para editar/adicionar relacionados
- 💬 Alertas em tempo real: "Este cliente já está em edição por outro utilizador"

---

## 📁 Organização de Pastas (Estrutura Next.js)

```
app/
│
├── clientes/
│   ├── [id]/page.tsx       # Ficha detalhada do cliente
│   ├── page.tsx            # Lista de clientes
│   └── actions.ts          # Server actions
│
├── projetos/
│   ├── [id]/page.tsx       # Detalhes do projeto
│   ├── page.tsx            # Lista de projetos
│   └── actions.ts
│
├── tarefas/
│   └── ...
│
├── configuracoes/
│   ├── empregados/
│   ├── acesso/
│   ├── ponto/
│   └── ...
```

---

## 🔒 Segurança & Boas Práticas

- ✅ **Validação rigorosa** com Zod (futuramente)
- ✅ **Autorização por middleware e RLS no Supabase**
- ✅ **Credenciais protegidas via `.env`**
- ✅ **Separação de camadas (Controller, Service, Repository)**
- ✅ **Controle de sessão, tokens e política de logout**
- ✅ **Gestão de arquivos via Blob com links privados**

---

## 📌 Próximos Passos

| Tarefa | Prioridade |
|--------|------------|
| 🔄 Integração com banco real (PostgreSQL) | Alta |
| ✅ Autenticação robusta com NextAuth.js | Alta |
| 🧪 Testes automatizados com Jest & Cypress | Média |
| 🌐 Tradução multilíngue (i18n) | Média |
| 🧲 Notificações por email/WebPush | Baixa |
| 🔁 Drag and Drop no Kanban | Baixa |

---

## 🎨 Paleta de Cores

```
#F75C03 // laranja viva
#D90368 // rosa escuro
#820263 // roxo intenso
#291720 // preto vinho
#04A777 // verde água
```

---

## 📎 Contribuição

💡 Se tens interesse em contribuir com o GestOffice, seja com desenvolvimento, UI/UX, testes ou documentação, **estás mais que convidado!**

---

## 👨‍💻 Autor

**George Acioli**  
Desenvolvedor Frontend e Contabilista em Portugal  
[GitHub](https://github.com/acioligeorge) | [LinkedIn](https://linkedin.com/in/acioligeorge) | ✉️ contato@acioliconsultoria.com

---

## 📌 Licença

Distribuído sob a licença MIT.(Em breve))
