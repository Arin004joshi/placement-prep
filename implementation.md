# Interview Preparation Platform - Implementation Blueprint

## Current Session Mode

**Mode:** Schema design

This draft focuses on MongoDB collection design, relationships, validation rules, indexes, and the data contracts needed to support the MERN interview preparation platform.

---

## 1. Product Scope

The platform prepares users for MAANG-level product company interviews across:

- DBMS
- OOPs
- Operating Systems
- MERN Stack

Core hierarchy:

```text
Subject -> Topic -> Subtopic -> Question
```

Every question should support:

- Difficulty: `easy`, `medium`, `hard`
- Type: `mcq`, `descriptive`, `conceptual`, `coding`
- Expected answer
- Common mistakes
- Interviewer follow-ups
- Tags for weak-area analytics and revision scheduling

---

## 2. Database Design Goals

The MongoDB design should:

- Prevent duplicate question entries.
- Support fast subject/topic/question lookups.
- Track per-user progress without mutating global question data.
- Enable spaced repetition using attempt history and weakness signals.
- Support mock interview sessions with autosave and post-session scoring.
- Handle large datasets through pagination and indexes.
- Keep global learning content separate from user-specific state.

---

## 3. Collection Overview

Recommended collections:

```text
users
subjects
topics
subtopics
questions
questionAttempts
userProgress
mockSessions
revisionQueue
```

Optional later collections:

```text
bookmarks
reports
contentVersions
auditLogs
```

---

## 4. `users`

Stores account and authentication data.

### Fields

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: "user" | "admin",
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `name` is required.
- `email` is required, lowercase, trimmed, and unique.
- `passwordHash` is required.
- `role` defaults to `user`.
- `isActive` defaults to `true`.

### Indexes

```js
{ email: 1 } unique
{ role: 1 }
{ createdAt: -1 }
```

### Notes

- Never store raw passwords.
- JWT payload should contain only safe identifiers such as `userId` and `role`.

---

## 5. `subjects`

Stores top-level learning areas.

### Fields

```js
{
  _id: ObjectId,
  name: "DBMS" | "OOPs" | "OS" | "MERN Stack",
  slug: String,
  description: String,
  displayOrder: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `name` is required.
- `slug` is required and unique.
- `displayOrder` defaults to `0`.
- `isPublished` defaults to `false`.

### Indexes

```js
{ slug: 1 } unique
{ isPublished: 1, displayOrder: 1 }
```

---

## 6. `topics`

Stores major topics inside a subject.

Example:

```text
DBMS -> Transactions
OS -> Process Management
MERN Stack -> Express Middleware
```

### Fields

```js
{
  _id: ObjectId,
  subjectId: ObjectId,
  title: String,
  slug: String,
  shortTheory: String,
  prerequisites: [ObjectId],
  displayOrder: Number,
  estimatedMinutes: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `subjectId` is required.
- `title` is required.
- `slug` is required.
- `shortTheory` is required for published topics.
- `estimatedMinutes` should be non-negative.

### Indexes

```js
{ subjectId: 1, slug: 1 } unique
{ subjectId: 1, isPublished: 1, displayOrder: 1 }
```

### Notes

- `prerequisites` can reference other topics for unlock paths.
- Keep topic theory short here. Longer articles can be added later through a dedicated content collection if needed.

---

## 7. `subtopics`

Stores smaller learning units inside a topic.

Example:

```text
Transactions -> ACID Properties
Transactions -> Isolation Levels
```

### Fields

```js
{
  _id: ObjectId,
  subjectId: ObjectId,
  topicId: ObjectId,
  title: String,
  slug: String,
  shortTheory: String,
  displayOrder: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `subjectId`, `topicId`, `title`, and `slug` are required.
- `slug` must be unique within the topic.

### Indexes

```js
{ topicId: 1, slug: 1 } unique
{ subjectId: 1, topicId: 1, displayOrder: 1 }
{ isPublished: 1 }
```

### Notes

- Storing `subjectId` here is intentional denormalization for faster filtering and analytics.

---

## 8. `questions`

Stores global interview question content.

### Fields

```js
{
  _id: ObjectId,
  subjectId: ObjectId,
  topicId: ObjectId,
  subtopicId: ObjectId,

  type: "mcq" | "descriptive" | "conceptual" | "coding",
  difficulty: "easy" | "medium" | "hard",

  title: String,
  prompt: String,
  normalizedPromptHash: String,

  options: [
    {
      key: String,
      text: String,
      isCorrect: Boolean
    }
  ],

  expectedAnswer: String,
  explanation: String,
  commonMistakes: [String],
  followUps: [
    {
      question: String,
      expectedAnswer: String
    }
  ],

  tags: [String],
  concepts: [String],
  estimatedMinutes: Number,
  source: String,
  isPublished: Boolean,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `subjectId`, `topicId`, `subtopicId`, `type`, `difficulty`, and `prompt` are required.
- `difficulty` must be one of `easy`, `medium`, `hard`.
- `type` must be one of `mcq`, `descriptive`, `conceptual`, `coding`.
- MCQ questions must have at least two options.
- MCQ questions must have at least one correct option.
- Non-MCQ questions should not require `options`.
- `expectedAnswer` is required for published questions.
- `normalizedPromptHash` is required and unique per subtopic.

### Duplicate Prevention

Before inserting a question:

1. Trim whitespace.
2. Lowercase the prompt.
3. Collapse repeated spaces.
4. Remove non-semantic punctuation if desired.
5. Generate `normalizedPromptHash`.

Unique index:

```js
{ subtopicId: 1, normalizedPromptHash: 1 } unique
```

### Indexes

```js
{ subjectId: 1, topicId: 1, subtopicId: 1 }
{ difficulty: 1, type: 1 }
{ tags: 1 }
{ concepts: 1 }
{ isPublished: 1, difficulty: 1 }
{ subtopicId: 1, normalizedPromptHash: 1 } unique
```

### Notes

- Keep questions immutable from the user's perspective.
- User-specific answers, scores, and revision state belong in attempt/progress collections.

---

## 9. `questionAttempts`

Stores every user attempt for analytics, accuracy, and spaced repetition.

### Fields

```js
{
  _id: ObjectId,
  userId: ObjectId,
  questionId: ObjectId,
  subjectId: ObjectId,
  topicId: ObjectId,
  subtopicId: ObjectId,

  mode: "practice" | "revision" | "mock",
  mockSessionId: ObjectId,

  submittedAnswer: Mixed,
  isCorrect: Boolean,
  score: Number,
  maxScore: Number,
  timeSpentSeconds: Number,
  skipped: Boolean,

  mistakeTags: [String],
  feedback: String,

  attemptedAt: Date,
  createdAt: Date
}
```

### Validation Rules

- `userId` and `questionId` are required.
- `mode` is required.
- `score` must be between `0` and `maxScore`.
- `skipped` defaults to `false`.
- `attemptedAt` defaults to current time.

### Indexes

```js
{ userId: 1, attemptedAt: -1 }
{ userId: 1, questionId: 1, attemptedAt: -1 }
{ userId: 1, subjectId: 1, topicId: 1 }
{ userId: 1, isCorrect: 1 }
{ mockSessionId: 1 }
```

### Notes

- This collection can grow quickly. Always paginate attempt history.
- Analytics should aggregate from this collection, then cache summaries in `userProgress`.

---

## 10. `userProgress`

Stores current mastery snapshots per user and learning unit.

Recommended granularity:

```text
One document per user + subject + topic + optional subtopic
```

### Fields

```js
{
  _id: ObjectId,
  userId: ObjectId,
  subjectId: ObjectId,
  topicId: ObjectId,
  subtopicId: ObjectId,

  completedQuestionIds: [ObjectId],
  masteredQuestionIds: [ObjectId],
  weakQuestionIds: [ObjectId],

  easy: {
    attempted: Number,
    correct: Number,
    mastery: Number,
    unlocked: Boolean
  },
  medium: {
    attempted: Number,
    correct: Number,
    mastery: Number,
    unlocked: Boolean
  },
  hard: {
    attempted: Number,
    correct: Number,
    mastery: Number,
    unlocked: Boolean
  },

  totalAttempted: Number,
  totalCorrect: Number,
  accuracy: Number,
  masteryLevel: "not_started" | "learning" | "intermediate" | "strong" | "mastered",

  weakConcepts: [
    {
      concept: String,
      misses: Number,
      lastMissedAt: Date
    }
  ],

  lastPracticedAt: Date,
  completedAt: Date,
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `userId`, `subjectId`, and `topicId` are required.
- `accuracy` and difficulty mastery values must be between `0` and `100`.
- `version` defaults to `1` and is incremented during updates.

### Indexes

```js
{ userId: 1, subjectId: 1, topicId: 1, subtopicId: 1 } unique
{ userId: 1, masteryLevel: 1 }
{ userId: 1, lastPracticedAt: -1 }
```

### Race Condition Handling

Use atomic updates for counters:

```js
$inc: {
  totalAttempted: 1,
  totalCorrect: isCorrect ? 1 : 0
}
```

For critical updates, use one of:

- MongoDB transactions.
- Optimistic concurrency with a `version` field.
- Idempotency keys for repeated submissions.

---

## 11. `mockSessions`

Stores timed mock interview sessions, autosave state, and final result.

### Fields

```js
{
  _id: ObjectId,
  userId: ObjectId,
  status: "in_progress" | "submitted" | "abandoned" | "expired",

  subjects: [ObjectId],
  difficultyMix: {
    easy: Number,
    medium: Number,
    hard: Number
  },

  questionIds: [ObjectId],
  answers: [
    {
      questionId: ObjectId,
      answer: Mixed,
      skipped: Boolean,
      timeSpentSeconds: Number,
      savedAt: Date
    }
  ],

  durationMinutes: Number,
  startedAt: Date,
  expiresAt: Date,
  submittedAt: Date,

  score: Number,
  maxScore: Number,
  accuracy: Number,
  feedbackSummary: String,
  weakConcepts: [String],

  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `userId`, `status`, `questionIds`, `durationMinutes`, `startedAt`, and `expiresAt` are required.
- `status` defaults to `in_progress`.
- `questionIds` should not contain duplicates.
- `expiresAt` must be after `startedAt`.

### Indexes

```js
{ userId: 1, status: 1, startedAt: -1 }
{ userId: 1, expiresAt: 1 }
{ status: 1, expiresAt: 1 }
```

### Notes

- Autosave updates the `answers` array.
- A scheduled job can mark old `in_progress` sessions as `abandoned` or `expired`.

---

## 12. `revisionQueue`

Stores per-user spaced repetition state.

### Fields

```js
{
  _id: ObjectId,
  userId: ObjectId,
  questionId: ObjectId,
  subjectId: ObjectId,
  topicId: ObjectId,
  subtopicId: ObjectId,

  incorrectCount: Number,
  correctStreak: Number,
  lastAttemptedAt: Date,
  nextReviewAt: Date,
  priority: Number,

  status: "due" | "scheduled" | "mastered",
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules

- `userId` and `questionId` are required.
- `incorrectCount` and `correctStreak` default to `0`.
- `priority` defaults to `0`.
- `status` defaults to `scheduled`.

### Indexes

```js
{ userId: 1, questionId: 1 } unique
{ userId: 1, status: 1, nextReviewAt: 1 }
{ userId: 1, priority: -1 }
{ userId: 1, topicId: 1 }
```

### Spaced Repetition Scheduling

Initial recommendation:

```text
If incorrect:
  incorrectCount += 1
  correctStreak = 0
  nextReviewAt = now + min(7 days, incorrectCount * 1 day)
  priority += 10 + incorrectCount

If correct:
  correctStreak += 1
  priority -= 5
  nextReviewAt = now + interval based on correctStreak

Correct streak intervals:
  1 correct: 2 days
  2 correct: 5 days
  3 correct: 10 days
  4+ correct: mark as mastered
```

---

## 13. Relationships

### Content Relationships

```text
subjects._id
  -> topics.subjectId
  -> subtopics.topicId
  -> questions.subtopicId
```

### User State Relationships

```text
users._id
  -> questionAttempts.userId
  -> userProgress.userId
  -> mockSessions.userId
  -> revisionQueue.userId
```

### Design Decision

Use references instead of deeply embedded content because:

- Questions can be queried independently.
- Attempt history grows without bloating user documents.
- Topics and questions can be updated by admins without rewriting user progress.
- Analytics need indexed queries by subject, topic, difficulty, and concept.

---

## 14. Difficulty Unlock Rules

Recommended thresholds:

```text
Medium unlock:
  Easy attempted >= 10
  Easy accuracy >= 75%

Hard unlock:
  Medium attempted >= 10
  Medium accuracy >= 80%
  Medium correct streak >= 3 recently
```

Schema support:

- Store per-difficulty counters in `userProgress`.
- Store full attempt evidence in `questionAttempts`.
- Recompute unlock state after every submitted answer.

Edge case:

- If a topic has fewer than 10 easy questions, use `min(totalEasyQuestions, 10)` as the threshold.

---

## 15. Question Selection Data Requirements

The question engine needs:

From `questions`:

- Subject/topic/subtopic
- Difficulty
- Type
- Tags/concepts
- Published state

From `questionAttempts`:

- Recently attempted questions
- Incorrect questions
- Skipped questions
- Time spent

From `userProgress`:

- Mastered questions
- Weak concepts
- Difficulty unlock status

From `revisionQueue`:

- Due questions
- Priority
- Incorrect count
- Next review date

Selection should:

- Exclude mastered questions in normal practice.
- Prioritize weak and incorrect questions.
- Avoid repeats unless the user is in revision mode.
- Respect unlocked difficulty levels.
- Handle empty question pools gracefully.

---

## 16. Edge Case Mapping

### User skips all questions

Record attempts with:

```js
skipped: true
isCorrect: false
score: 0
```

Then recommend:

- Lowest-unlocked difficulty questions.
- Topics with no progress.
- Short theory review for the skipped topic.

### User aces everything

Update mastery and unlock next difficulty.

If hard is already mastered:

- Recommend mixed mock interviews.
- Recommend adjacent weak or untouched topics.

### Empty database

API should return:

```js
{
  data: [],
  message: "No published content is available yet."
}
```

UI should show a clean empty state instead of crashing.

### Duplicate question entries

Use:

- `normalizedPromptHash`
- Unique compound index on `subtopicId + normalizedPromptHash`
- Admin-side duplicate validation before save

### Concurrent submissions

Use:

- Submission idempotency key
- Atomic counter updates
- Transactions when writing attempt, progress, and revision queue together

---

## 17. API Pagination Contract

All list endpoints should support:

```text
page
limit
sort
filter
```

Recommended response shape:

```js
{
  data: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
}
```

Default limits:

```text
Default: 20
Maximum: 100
```

---

## 18. Security Requirements Affecting Schema

- Store only `passwordHash`, never raw passwords.
- Add `createdBy` and `updatedBy` on content collections for admin accountability.
- Keep role on `users`.
- Validate all ObjectIds before querying.
- Use strict schema validation in Mongoose.
- Sanitize user-generated text answers before storage or rendering.

---

## 19. Mongoose Implementation Order

Recommended first models:

1. `User`
2. `Subject`
3. `Topic`
4. `Subtopic`
5. `Question`
6. `QuestionAttempt`
7. `UserProgress`
8. `RevisionQueue`
9. `MockSession`

This order keeps dependencies clear and allows early CRUD testing.

---

## 20. Suggested Backend Folder Structure

```text
server/
  src/
    config/
      db.js
      env.js
    models/
      User.js
      Subject.js
      Topic.js
      Subtopic.js
      Question.js
      QuestionAttempt.js
      UserProgress.js
      RevisionQueue.js
      MockSession.js
    controllers/
    services/
      questionSelection.service.js
      progress.service.js
      revision.service.js
      mockSession.service.js
    middleware/
      auth.middleware.js
      error.middleware.js
      rateLimit.middleware.js
      validate.middleware.js
    routes/
    utils/
      normalizePrompt.js
      pagination.js
      asyncHandler.js
```

---

## 21. Server Phase 1 Deliverables

Backend Phase 1 progress checklist:

- [x] Initialize backend project under `server/`.
- [x] Add `server/package.json`.
- [x] Install backend dependencies.
- [x] Add `.env.example`.
- [x] Add local `server/.env` for development.
- [x] Connect MongoDB through `server/src/config/db.js`.
- [x] Add environment validation through `server/src/config/env.js`.
- [x] Create Express app entry point.
- [x] Create server startup entry point.
- [x] Add centralized error handling.
- [x] Add 404 route handling.
- [x] Add request rate limiting.
- [x] Add MongoDB query sanitization.
- [x] Add request body sanitization helper.
- [x] Add JWT auth middleware.
- [x] Add admin-only route guard.
- [x] Add pagination helper.
- [x] Add prompt normalization helper.
- [x] Add duplicate question hash generation.
- [x] Implement `User` model.
- [x] Implement `Subject` model.
- [x] Implement `Topic` model.
- [x] Implement `Subtopic` model.
- [x] Implement `Question` model.
- [x] Implement `QuestionAttempt` model.
- [x] Implement `UserProgress` model.
- [x] Implement `RevisionQueue` model.
- [x] Implement `MockSession` model.
- [x] Add schema validations.
- [x] Add MongoDB indexes.
- [x] Prevent duplicate question entries with `subtopicId + normalizedPromptHash`.
- [x] Implement signup route.
- [x] Implement login route.
- [x] Implement `/api/auth/me` route.
- [x] Implement public read routes for subjects.
- [x] Implement public read routes for topics.
- [x] Implement public read routes for subtopics.
- [x] Implement public read routes for questions.
- [x] Implement admin CRUD routes for subjects.
- [x] Implement admin CRUD routes for topics.
- [x] Implement admin CRUD routes for subtopics.
- [x] Implement admin CRUD routes for questions.
- [x] Add initial question selection service.
- [x] Add initial progress update service.
- [x] Add initial revision queue service.
- [x] Add initial mock session service.
- [x] Add backend README.
- [x] Add root `.gitignore`.
- [x] Run JavaScript syntax verification.
- [x] Run app-load smoke verification.

Remaining server work for later phases:

- [ ] Add first-admin setup script.
- [ ] Add seed data for subjects/topics/subtopics/questions.
- [ ] Add question selection API endpoint.
- [ ] Add attempt submission API endpoint.
- [ ] Add progress dashboard API endpoint.
- [ ] Add revision mode API endpoint.
- [ ] Add mock interview start/autosave/submit APIs.
- [ ] Add automated backend tests.
- [ ] Add production deployment configuration.

---

## 22. Next Step

The backend project structure and Mongoose models have now been created under `server/`.

Implemented Phase 1 backend foundation:

- `server/package.json`
- Express app and server entry point
- MongoDB connection config
- Environment validation
- JWT signup/login/me routes
- Protected route middleware
- Admin-only content write protection
- Rate limiting for API and auth routes
- Input sanitization helpers
- Centralized error handling
- Pagination helper
- Prompt normalization and duplicate-question hash helper
- Mongoose models:
  - `User`
  - `Subject`
  - `Topic`
  - `Subtopic`
  - `Question`
  - `QuestionAttempt`
  - `UserProgress`
  - `RevisionQueue`
  - `MockSession`
- Public read CRUD routes for:
  - Subjects
  - Topics
  - Subtopics
  - Questions
- Admin write CRUD routes for:
  - Subjects
  - Topics
  - Subtopics
  - Questions
- Initial service modules for:
  - Question selection
  - Progress updates
  - Revision queue scheduling
  - Mock session expiry handling

Verification completed:

```text
node --check server/src/**/*.js
```

Next implementation step:

```text
Install dependencies -> configure .env -> run API -> test auth/content CRUD with MongoDB
```

After that, continue into Phase 2:

```text
Question engine endpoints -> attempt submission -> progress dashboard data -> revision mode API
```

---

## 23. Client Phase 1 Implementation Plan

Phase 1 client work should create the React application foundation and connect it to the existing backend APIs.

### Current Status

- [x] Server Phase 1 foundation is complete.
- [x] Client Phase 1 foundation is complete.
- [x] Backend dependencies are installed.
- [x] Client dependencies are installed.
- [x] Backend syntax/app-load verification passed.
- [x] Client lint verification passed.
- [x] Client production build verification passed.
- [x] React dev server was started successfully at `http://127.0.0.1:5173`.
- [ ] End-to-end browser testing with backend + MongoDB running is still pending.
- [ ] First admin promotion is still pending.
- [x] Seed content loading was tested successfully.

### Goals

- Set up a React frontend project.
- Add routing and protected routes.
- Add login/signup screens.
- Store JWT auth state safely.
- Build the main app shell.
- Display subjects, topics, subtopics, and questions from the backend.
- Add basic admin screens for content CRUD.
- Handle loading, empty, and error states cleanly.

### Recommended Stack

```text
React
Vite
React Router
Axios
Tailwind CSS
Lucide React
```

Optional later:

```text
React Query
Zustand
React Hook Form
Zod
```

For Phase 1, keep the setup simple. Add heavier state/query tools only when the client starts handling attempts, progress analytics, mock sessions, and revision scheduling.

### Folder Structure

```text
client/
  src/
    api/
      http.js
      auth.api.js
      content.api.js
    components/
      layout/
        AppLayout.jsx
        Sidebar.jsx
        Topbar.jsx
      ui/
        Button.jsx
        Input.jsx
        Select.jsx
        EmptyState.jsx
        LoadingState.jsx
        ErrorState.jsx
    context/
      AuthContext.jsx
    pages/
      auth/
        Login.jsx
        Signup.jsx
      dashboard/
        Dashboard.jsx
      subjects/
        Subjects.jsx
        SubjectDetail.jsx
      topics/
        TopicDetail.jsx
      questions/
        QuestionDetail.jsx
      admin/
        AdminSubjects.jsx
        AdminTopics.jsx
        AdminSubtopics.jsx
        AdminQuestions.jsx
    routes/
      AppRouter.jsx
      ProtectedRoute.jsx
      AdminRoute.jsx
    utils/
      tokenStorage.js
      formatters.js
    App.jsx
    main.jsx
```

### Environment File

Create:

```text
client/.env
```

With:

```env
VITE_API_URL=http://localhost:5000/api
```

### Phase 1 Screens

#### Public/Auth

```text
/login
/signup
```

Required behavior:

- Submit credentials to backend.
- Store JWT after success.
- Redirect authenticated users to dashboard.
- Show validation and API errors.

#### Protected User Screens

```text
/dashboard
/subjects
/subjects/:subjectId
/topics/:topicId
/questions/:questionId
```

Required behavior:

- Fetch published content from backend.
- Show paginated lists.
- Show empty states when no content exists.
- Prevent access when JWT is missing or invalid.

#### Admin Screens

```text
/admin/subjects
/admin/topics
/admin/subtopics
/admin/questions
```

Required behavior:

- Only show for users with `role: "admin"`.
- Create, update, and delete content using admin-protected backend routes.
- Support basic filters:
  - subject
  - topic
  - subtopic
  - difficulty
  - type
  - published status

### API Integration

The client should call these existing backend endpoints:

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me

GET /api/subjects
GET /api/topics
GET /api/subtopics
GET /api/questions

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

### Auth Handling

Recommended Phase 1 approach:

- Store token in `localStorage`.
- Attach token to requests with an Axios interceptor.
- On `401`, clear token and redirect to `/login`.
- Keep user data in `AuthContext`.
- Call `/api/auth/me` on app load if a token exists.

Later production improvement:

- Move from localStorage token storage to secure HTTP-only cookies.

### UI Requirements

The Phase 1 UI should be simple, usable, and structured:

- Sidebar navigation for main areas.
- Topbar with user identity and logout.
- Dashboard summary cards for subjects and content counts.
- Tables or compact lists for admin CRUD.
- Clear loading states.
- Graceful empty database fallback.
- Form-level validation messages.

Avoid building the full learning experience in Phase 1. The client should first prove that authentication, navigation, and content management work end to end.

### Client Phase 1 Deliverables

- [x] Initialize React app under `client/`.
- [x] Add `client/package.json`.
- [x] Install client dependencies.
- [x] Add `client/.env`.
- [x] Add `client/.env.example`.
- [x] Configure Vite.
- [x] Configure Tailwind CSS.
- [x] Configure ESLint.
- [x] Configure React Router.
- [x] Add Axios API client.
- [x] Add auth API module.
- [x] Add content API module.
- [x] Add token storage helper.
- [x] Add auth context.
- [x] Add protected routes.
- [x] Add admin-only routes.
- [x] Build login page.
- [x] Build signup page.
- [x] Build dashboard shell.
- [x] Build sidebar navigation.
- [x] Build topbar.
- [x] Build reusable UI components.
- [x] Build subject list view.
- [x] Build subject detail view.
- [x] Build topic detail view.
- [x] Build question detail view.
- [x] Build admin subjects CRUD view.
- [x] Build admin topics CRUD view.
- [x] Build admin subtopics CRUD view.
- [x] Build admin questions CRUD view.
- [x] Add loading states.
- [x] Add empty states.
- [x] Add API error states.
- [x] Add client README.
- [x] Run client lint verification.
- [x] Run client production build verification.
- [ ] Manually verify browser flow with backend and MongoDB running.

Remaining client work for later phases:

- [ ] Add React Query or equivalent server-state caching.
- [ ] Add richer form validation.
- [ ] Add attempt submission UI.
- [ ] Add question engine practice mode UI.
- [ ] Add progress analytics dashboard.
- [ ] Add smart revision mode UI.
- [ ] Add mock interview mode UI.
- [ ] Add frontend tests.
- [ ] Add production deployment configuration.

---

## 24. Phase 2 Implementation Plan

Phase 2 turns the platform from content management into a usable preparation system.

### Server Phase 2

- [x] Add first-admin setup script.
- [x] Add seed data script for DBMS, OOPs, OS, and MERN starter content.
- [x] Add practice question selection endpoint.
- [x] Add revision question selection endpoint.
- [x] Add attempt submission endpoint.
- [x] Update progress after each submitted attempt.
- [x] Update revision queue after each submitted attempt.
- [x] Add user progress summary endpoint.
- [ ] Add subject-wise mastery endpoint.
- [x] Add weak areas endpoint.

### Client Phase 2

- [x] Add practice mode page.
- [x] Add answer submission UI.
- [x] Add revision mode page.
- [x] Add progress dashboard widgets.
- [x] Add weak-area list.
- [x] Show subject/topic/subtopic hierarchy in the learning UI.
- [x] Add complete interview-ready roadmap fallback for DBMS, OOPs, OS, and MERN subjects.
- [x] Render all roadmap topics and subtopics across every subject.
- [x] Add per-subtopic copy buttons for AI teaching prompts.
- [x] Add self-managed completion checkboxes for roadmap subtopics.
- [x] Persist roadmap completion state in browser local storage.
- [x] Add persistent global light/dark theme toggle.
- [x] Add dark-mode styles across shared layout, forms, roadmap, dashboard, practice, progress, revision, topic, question, and admin pages.
- [ ] Add mastery indicators on subject/topic screens.

### Phase 2 Completion Criteria

- A user can request practice questions.
- A user can submit answers.
- The backend records attempts.
- Progress updates after submission.
- Incorrect questions enter the revision queue.
- The dashboard shows real progress metrics.

### Phase 2 Verification

- [x] Server syntax verification passed.
- [x] Client lint verification passed.
- [x] Client production build verification passed.
- [x] Seed script tested against a running MongoDB instance.
- [x] Expanded seed catalog with interview-ready topic/subtopic roadmap.
- [ ] Expanded seed catalog loaded into MongoDB Atlas after IP allowlist is fixed.
- [ ] Practice flow manually tested in browser.

### Phase 2 Commands

Promote a signed-up user to admin:

```bash
cd server
npm run make-admin -- user@example.com
```

Load starter content:

```bash
cd server
npm run seed
```

Run the application:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

---

## 25. Phase 3 Implementation Plan

Phase 3 should add mock interviews, richer analytics, and better learning UX.

### Server Phase 3

- [ ] Add mock interview start endpoint.
- [ ] Add mock interview autosave endpoint.
- [ ] Add mock interview submit endpoint.
- [ ] Add mock interview feedback endpoint.
- [ ] Add abandoned/expired session cleanup job.
- [ ] Add subject-wise and topic-wise analytics endpoints.
- [ ] Add idempotency keys for repeated attempt submissions.
- [ ] Add backend test suite.

### Client Phase 3

- [ ] Add mock interview setup screen.
- [ ] Add timed mock interview screen.
- [ ] Add autosave behavior.
- [ ] Add mock interview result page.
- [ ] Add subject-wise mastery charts.
- [ ] Add topic-wise weak-area drilldown.
- [ ] Add better admin question editor for MCQ options and follow-ups.
- [ ] Add frontend test suite.

### Client Phase 1 Completion Criteria

Phase 1 client is complete when:

- A user can sign up and log in.
- A logged-in user can view available subjects/topics/questions.
- An invalid or missing JWT redirects to login.
- An admin can create, edit, and delete learning content.
- Empty API responses render clean UI states.
- Client can be started with:

```bash
cd client
npm run dev
```
