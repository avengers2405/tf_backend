# Auth API Handoff (Frontend)

Base URL examples:
- Local: `http://localhost:5000`
- Auth base path: `/auth`

## 1) Register (auto-sends verification email)
**POST** `/auth/register`

Request body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

Success `201`:
```json
{
  "message": "registration successful, verify your email before login",
  "preview_link": "...only in non-production...",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "is_verified": false
  }
}
```

Errors:
- `400` missing required fields
- `409` username/email already exists

Notes:
- Backend sends verification email asynchronously (non-blocking).
- `preview_link` is exposed only when `NODE_ENV !== 'production'`.

## 2) Resend verification link
**POST** `/auth/magic-link/request`

Request body:
```json
{
  "identifier": "john@example.com"
}
```
(or username)

Always success-style response `200` (anti-enumeration):
```json
{
  "message": "If the account exists, a verification link will be sent",
  "preview_link": "...only in non-production..."
}
```

## 3) Verify email via magic link callback
Two supported variants:
- **GET** `/auth/magic-link/verify?token=...`
- **POST** `/auth/magic-link/verify` with `{ "token": "..." }`

Success `200`:
```json
{
  "message": "email verification successful",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "is_verified": true
  },
  "access_token": "...",
  "refresh_token": "..."
}
```

Failure:
- `400` token missing
- `401` invalid/expired token

## 4) Login
**POST** `/auth/login`

Request body:
```json
{
  "identifier": "john@example.com",
  "password": "StrongPassword123!"
}
```

Success `200` returns `access_token` + `refresh_token` + user.

Failure:
- `400` missing fields
- `401` invalid credentials
- `403` email not verified

## 5) Refresh token
**POST** `/auth/refresh`

Request body:
```json
{
  "refresh_token": "..."
}
```

Success `200`:
```json
{
  "message": "token refreshed",
  "access_token": "...",
  "refresh_token": "..."
}
```

Failure:
- `400` refresh token missing
- `401` invalid/expired refresh token

## 6) Logout
**POST** `/auth/logout`

Request body:
```json
{
  "refresh_token": "..."
}
```

Success `200`:
```json
{
  "message": "logout successful"
}
```

## 7) Get current user
**GET** `/auth/me`

Header required:
```http
Authorization: Bearer <access_token>
```

Success `200`:
```json
{
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "is_verified": true
  }
}
```

Failure:
- `401` missing/invalid access token
- `404` user not found

## Frontend flow to implement
1. Register page -> call `/auth/register`.
2. Show "Check your email" screen immediately after `201`.
3. Add "Resend verification link" button -> `/auth/magic-link/request`.
4. Verification callback page should read `token` from query string and call `/auth/magic-link/verify`.
5. On verification success, store tokens and route to app.
6. Attach `Authorization: Bearer <access_token>` for protected calls.
7. On `401` (expired access token), call `/auth/refresh`, replace tokens, retry request once.
8. Logout clears local tokens and calls `/auth/logout`.

## Token handling recommendation
- Keep `access_token` in memory if possible.
- If storing in browser storage, guard against XSS.
- Rotate tokens only through `/auth/refresh`.

## Environment assumptions frontend should know
- Verification email link points to: `${FRONTEND_URL}${AUTH_MAGIC_LINK_PATH}?token=...`
- Frontend must provide a route matching `AUTH_MAGIC_LINK_PATH`.

## Practical AI prompt for frontend dev
"Implement an auth module against these endpoints: register (auto-verification email), resend magic link, verify magic link callback, login, refresh, logout, me. Use bearer access token, refresh on 401 once, and a verification callback page that consumes ?token=... and persists returned access/refresh tokens."
