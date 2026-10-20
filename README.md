# FinTrack V3 — Personal Finance & Budget Manager

MERN portfolio application. React/Vite frontend (5174), Express API (5001), MongoDB Atlas, JWT authentication, budgets, transactions, savings goals, and a role-protected administrator dashboard.

## Windows setup

1. Extract ZIP, open the `fintrack-v3` folder in VS Code.
2. Run `npm.cmd install` then `npm.cmd run install:all`.
3. Copy `server/.env.example` to `server/.env`. Set your **own** MongoDB Atlas URI ending in database `fintrack` and a random JWT secret. Never commit `.env`.
4. Run `npm.cmd run dev`; open http://localhost:5174.
5. Register a normal user and test creating, editing, deleting transactions and budgets.

## One-time admin account

Add `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 14 characters) and optionally `ADMIN_NAME` to `server/.env`. From the root, run `npm.cmd run admin:create --prefix server` (after installing dependencies). It **creates a new account** with admin role, and refuses to promote an existing user. **Remove ADMIN_PASSWORD from `.env` after success** and restart the backend. Log in with that admin account; the Admin dashboard will appear. Public registration cannot request admin role.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/transactions`, `PUT/DELETE /api/transactions/:id`
- `GET /api/transactions/page?month=YYYY-MM&page=1` — paginated transactions (50/page)
- `GET/POST /api/budgets`, `DELETE /api/budgets/:id`
- `GET/POST /api/goals`, `PUT/DELETE /api/goals/:id`
- Admin only: `GET /api/admin/stats`, `GET /api/admin/users?page=1`, `PATCH /api/admin/users/:id/status`, `GET /api/admin/audit`

## Security and privacy

Financial records are scoped by authenticated user ID in API queries. Admins see user account information and aggregate record counts, **not individual users' financial records**. Account suspension is checked on each authenticated request. Public users cannot choose a role. Use test data, not real financial information, until independently security reviewed.

## Limitations and further work

- **Not yet production-certified.** No live MongoDB or browser end-to-end verification was possible during packaging.
- Legacy dashboard `/api/transactions` is limited to 2,000 records per selected month and returns an explicit error beyond that; a paginated API is provided for a future scalable UI.
- Tokens are held in localStorage; for production, consider secure httpOnly cookies, CSRF defenses, refresh-token rotation and logout revocation.
- Savings progress is entered manually and does not automatically transfer funds or change balances.
- No banking integration, real financial advice, automated recurring transaction processing, CSV import, user self-service deletion, or database backup automation.
- Add integration and end-to-end tests, deployment configuration, accessibility review, robust user quotas, and a privacy policy before public launch.
- Monetary amounts use integer cents in a single currency (USD); currency conversion is not supported.

## Quality checks

`npm.cmd test` for model validation tests; `npm.cmd run build` for frontend compilation. Run all core user/admin flows manually against a test MongoDB database.
