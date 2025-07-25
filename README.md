# Sistema de Check-in de Eventos

Este é um sistema simples de check-in de eventos, desenvolvido com Node.js, Express e SQLite. O projeto foi criado com foco em ser fácil de rodar e entender para fins acadêmicos.

## Como Rodar o Projeto

### 1. Instalar as Dependências

```bash
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`.

### 3. Rodar os Testes

```bash
npm test
```

## Fluxo TDD

O desenvolvimento deste projeto seguiu o fluxo de Test-Driven Development (TDD), onde os testes são escritos antes do código da funcionalidade. Isso garante que o código seja testável e que a funcionalidade atenda aos requisitos.

## Rotas da API

### `POST /register`

Registra um participante em um evento.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "eventId": 1
}
```

### `POST /checkin`

Realiza o check-in de um participante em um evento.

**Request Body:**

```json
{
  "participantId": 1,
  "eventId": 1
}
```

### `DELETE /register/:participantId`

Cancela a inscrição de um participante em um evento.

### `GET /participants/:id/events`

Lista todos os eventos em que um participante está inscrito.

## Banco de Dados

O banco de dados SQLite será salvo como `database.db` na raiz do projeto.
