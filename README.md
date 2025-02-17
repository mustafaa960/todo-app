# 📌 Todo App - NestJS



A **NestJS-based** API for managing Todos, featuring **authentication, authorization, GraphQL subscriptions, and more**.

---

## 🚀 Features

✅ **Authentication & Authorization** (JWT-based)\
✅ **GraphQL API** (Subscriptions included)\
✅ **MongoDB with Mongoose**\
✅ **Role-Based Access Control (RBAC)**\
✅ **WebSockets for real-time updates**\
✅ **Code Style with ESLint & Prettier**

---

## 📦 Installation

Ensure you have **Node.js** installed.

```bash
git clone https://github.com/mustafaa960/todo-app.git
cd todo-app
npm npm install --force
```

---

## ⚙️ Configuration

1. **Create **``** file** based on `example.env`:
   ```bash
   cp example.env .env
   ```
2. **Set environment variables**:
   - ``: MongoDB connection string
   - ``: Secret key for authentication
   - ``: Port number for the app

---

## ▶️ Running the App

Run the application in **development mode**:

```bash
npm run start:dev
```


---


## 🔌 API Endpoints

Once running, access the **GraphQL Playground**:\
📌 `http://127.0.0.1:3000/graphql`

### Example Queries:

#### 🔐 Login Example

**Mutation**
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
  }
}
```
**Variables**
```json
{
  "input": {
    "username": "admin",
    "password": "admin"
  }
}
```
**Response**
```json
{
  "data": {
    "login": {
      "accessToken": "your-jwt-access-token",
      "refreshToken": "your-jwt-refresh-token"
    }
  }
}
```

#### 📌  Create a To-Do (Authenticated User)

**Mutation**
```graphql
mutation CreateOwnTodo($input: CreateOwnTodoInput!) {
  createOwnTodo(input: $input) {
    _id
    title
    description
    status
    user {
      _id
      username
      fullName
      roleId
    }
    createdAt
    updatedAt
  }
}
```
**Variables**
```json
{
  "input": {
    "title": "todo6",
    "description": "todo6",
    "status": "PENDING"
  }
}
```
**Response**
```json
{
  "data": {
    "createOwnTodo": {
      "_id": "67b1841e506fbc00b9a1789",
      "title": "todo6",
      "description": "todo6",
      "status": "PENDING",
      "user": {
        "_id": "67b047ebb5082a343f123",
        "username": "user",
        "fullName": "test user",
        "roleId": "67b047ebb5082a343f96456"
      },
      "createdAt": "2025-02-16T06:22:22.092Z",
      "updatedAt": "2025-02-16T06:22:22.092Z"
    }
  }
}
```

#### 🔄 Subscription for To-Do Updates
**Subscription**
```graphql
subscription SubscriptionUpdateTodo {
  todoUpdated {
    _id
    title
    description
    status
    user {
      _id
      username
      fullName
      roleId
    }
    createdAt
    updatedAt
  }
}

```
**Response (When To-Do is Updated)**
```json
{
  "data": {
    "createOwnTodo": {
      "_id": "67b1841e506fbc00b9a1789",
      "title": "todo6",
      "description": "todo6",
      "status": "PENDING",
      "user": {
        "_id": "67b047ebb5082a343f123",
        "username": "user",
        "fullName": "test user",
        "roleId": "67b047ebb5082a343f96456"
      },
      "createdAt": "2025-02-16T06:22:22.092Z",
      "updatedAt": "2025-02-16T06:22:22.092Z"
    }
  }
}
```

## 🔗 Resources

- 📖 **NestJS Documentation**: [https://docs.nestjs.com](https://docs.nestjs.com)
- 📖 **GraphQL**: [https://graphql.org](https://graphql.org)
- 📖 **MongoDB**: [https://www.mongodb.com](https://www.mongodb.com)


