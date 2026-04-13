# Revisei API

API backend do projeto **Revisei**, responsável pelo gerenciamento de usuários, matérias (subjects) e tópicos (topics), com autenticação JWT.

---

## Tecnologias

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT (JSON Web Token)
* Bcrypt

---

## Funcionalidades

* Autenticação de usuário (register/login)
* Proteção de rotas com JWT
* CRUD de Subjects (matérias)
* CRUD de Topics (tópicos)
* Validação de ownership (usuário só acessa seus dados)

---

## Estrutura do projeto

src/ <br>
├── controllers/ <br>
├── routes/ <br>
├── middlewares/ <br>
├── lib/ <br>
└── server.ts

---

## Como Começar

> **Importante:** Esta aplicação depende do [Revisei Frontend](https://github.com/LuisFPamplona/back-end-revisei) para funcionar. Certifique-se de que o servidor esteja rodando antes de iniciar o frontend.

### Instalação

1. **Clone os repositórios:**
   ```bash
   # Clone o Frontend
   git clone https://github.com/LuisFPamplona/front-end-revisei.git
   
   # Clone o Backend (em outra pasta)
   git clone https://github.com/LuisFPamplona/back-end-revisei.git

### 2. Instale as dependências

npm install

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env`:

DATABASE_URL="postgresql://user:password@localhost:5432/revisei"
JWT_SECRET="sua_chave_secreta"

### 4. Rode as migrations

npx prisma migrate dev

### 5. Inicie o servidor

npm run dev

---

## Autenticação

As rotas protegidas exigem um token JWT no header:

Authorization: Bearer TOKEN

---

## Rotas principais

### Auth

* POST /auth/register
* POST /auth/login

### Subjects

* GET /subjects
* POST /subjects
* PATCH /subjects/:id
* DELETE /subjects/:id

### Topics

* GET /subjects/:subjectId/topics
* POST /subjects/:subjectId/topics
* PATCH /topics/:id
* DELETE /topics/:id

---

## Conceitos aplicados

* RESTful API design
* Middleware (auth, logging)
* Relational validation (user → subject → topic)
* Clean code e separação de responsabilidades

---

## Licença

Este projeto é para fins de estudo.
