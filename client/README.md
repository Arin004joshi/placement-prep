# Interview Prep Client

Phase 1 React client for the Interview Preparation Platform.

## Setup

```bash
cd client
npm install
npm run dev
```

The client expects the backend API at:

```text
http://localhost:5000/api
```

Override this in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production Vercel builds, `client/.env.production` points to the Render API:

```env
VITE_API_URL=https://placement-prep-zq6u.onrender.com/api
```

Vercel SPA routing is handled by `client/vercel.json`, which rewrites deep links such as `/login` to `index.html`.
