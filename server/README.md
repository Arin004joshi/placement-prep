# Interview Prep API

Phase 1 backend for the MERN Interview Preparation Platform.

## Setup

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Update `.env` before running:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/interview-prep
JWT_SECRET=replace-with-a-long-random-secret
```

## Main Endpoints

### Health

```text
GET /api/health
```

### Auth

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Content

Public read endpoints:

```text
GET /api/subjects
GET /api/subjects/:id
GET /api/topics
GET /api/topics/:id
GET /api/subtopics
GET /api/subtopics/:id
GET /api/questions
GET /api/questions/:id
```

Admin-only write endpoints:

```text
POST   /api/subjects
PATCH  /api/subjects/:id
DELETE /api/subjects/:id

POST   /api/topics
PATCH  /api/topics/:id
DELETE /api/topics/:id

POST   /api/subtopics
PATCH  /api/subtopics/:id
DELETE /api/subtopics/:id

POST   /api/questions
PATCH  /api/questions/:id
DELETE /api/questions/:id
```

## Pagination

List endpoints support:

```text
page
limit
sort
```

Example:

```text
GET /api/questions?page=1&limit=20&difficulty=easy&isPublished=true
```

## Notes

- Signup creates a regular `user`.
- Admin role assignment should be done manually in MongoDB for the first admin account.
- Duplicate questions are blocked by a unique `subtopicId + normalizedPromptHash` index.
- Non-public write routes require `Authorization: Bearer <token>`.
