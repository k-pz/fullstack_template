Fullstack template: Django + DRF API in `backend/`, Bun + React + Tailwind + shadcn/ui SPA in `frontend/`, tied together with mise.

- Tools are pinned in `mise.toml` (bun, uv). Python comes from `backend/.python-version` via uv.
- Run backend commands from `backend/` and frontend commands from `frontend/`. mise tasks run from the repo root.
- The frontend never talks to a database. All data and business logic live in Django; the frontend calls `/api/*`.

## Tasks (repo root)

| Task | Does |
|------|------|
| `mise run dev` | Django on `:8000` and the frontend on `:3000`, in parallel |
| `mise run check` | read-only QA for both: format-check, lint, typecheck, test |
| `mise run backend:check` / `frontend:check` | read-only QA for one side |
| `mise run backend:fix` / `frontend:fix` | QA that rewrites files: format, lint-fix, typecheck, test |

Before finishing a change, run `mise run check`, or the check for the side you touched.

# Backend (`backend/`)

Default to using uv for everything Python.

- Use `uv run <cmd>` instead of activating `.venv` or calling `python`/`pip` directly
- Use `uv add <pkg>` / `uv add --dev <pkg>` instead of `pip install` or editing `pyproject.toml` by hand
- Use `uv sync` instead of `pip install -r requirements.txt`. There is no `requirements.txt`; `uv.lock` is the lockfile.
- Use `uv run python manage.py <command>` for Django commands (`runserver`, `makemigrations`, `migrate`, `createsuperuser`, `shell`)
- Use `uv run poe <task>` for project tasks (defined in `[tool.poe.tasks]` in `pyproject.toml`)
- Python version is pinned in `.python-version` (3.14). Use modern syntax; ruff's `UP` rules enforce it.

## Backend tasks

| Task | Runs | Notes |
|------|------|-------|
| `uv run poe test` | `pytest` | |
| `uv run poe lint` | `ruff check` | `lint-fix` applies fixes |
| `uv run poe format-check` | `ruff format --check` | `format` rewrites files |
| `uv run poe typecheck` | `ty check` | warnings are errors |
| `uv run poe all` | format, lint-fix, typecheck, test | modifies files |
| `uv run poe check` | format-check, lint, typecheck, test | read-only |

- Use `ruff` instead of `black`, `isort`, or `flake8`. Line length is 120.
- Use `ty` instead of `mypy` or `pyright`. `django-types` provides the Django stubs.
- Use `pytest` + `pytest-django` instead of `manage.py test` or `unittest.TestCase`.

## Backend stack

- Django + Django REST Framework. Don't add FastAPI, Flask, or Ninja.
- Build API endpoints with DRF `ModelSerializer` + `ModelViewSet`, registered on the `DefaultRouter` in `src/backend/urls.py`. Don't write plain Django views returning `JsonResponse`.
- SQLite (`db.sqlite3`) via the Django ORM. Don't write raw SQL or add SQLAlchemy.
- `django-cors-headers` allows `http://localhost:3000` in `CORS_ORIGIN_WHITELIST`. The dev server proxies `/api/*`, so the browser normally makes same-origin requests; add an origin there only if a frontend calls `:8000` directly.

## Backend layout

```
src/backend/   project package: settings.py, urls.py, asgi.py, wsgi.py
src/<app>/     one package per Django app: models, serializers, views, admin, migrations
tests/         pytest tests
```

- `src/` layout: packages are importable as `backend` and `<app>` (not `src.<app>`).
- The API lives under `/api/`, e.g. `/api/items/` and `/api/items/<id>/`. Admin is at `/admin/`.
- Create an app with `mkdir src/<app> && uv run python manage.py startapp <app> src/<app>`, then add it to `INSTALLED_APPS`.
- After changing a model, run `uv run python manage.py makemigrations` and commit the migration. Never edit applied migrations. Ruff skips `migrations/`.

## Backend testing

Use `uv run poe test` to run tests. Mark tests that touch the database with `@pytest.mark.django_db`. Use pytest-django's `client` fixture for API tests.

```py#tests/test_items.py
import pytest

from items.models import Item


@pytest.mark.django_db
def test_create_item_via_api(client):
    response = client.post("/api/items/", {"name": "Milk"}, content_type="application/json")

    assert response.status_code == 201
    assert Item.objects.get().name == "Milk"
```

## Running the backend

```sh
uv run python manage.py migrate
uv run python manage.py runserver   # http://localhost:8000/api/
```

`SECRET_KEY` reads `DJANGO_SECRET_KEY` from the environment; the fallback is for local dev only.

# Frontend (`frontend/`)

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun install` / `bun add <pkg>` / `bun add -d <pkg>` instead of `npm`, `yarn`, or `pnpm`. `bun.lock` is the lockfile.
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads `.env`, so don't use dotenv.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile, and Bun.$`ls` over execa.

## Frontend tasks

| Task | Runs | Notes |
|------|------|-------|
| `bun run dev` | `bun --hot src/index.ts` | http://localhost:3000, HMR |
| `bun run test` | `bun test` | |
| `bun run lint` | `oxlint --deny-warnings` | `lint-fix` applies fixes |
| `bun run format-check` | `oxfmt --check` | `format` rewrites files |
| `bun run typecheck` | `bun check` | |
| `bun run all` | format, lint-fix, typecheck, test | modifies files |
| `bun run verify` | format-check, lint, typecheck, test | read-only |
| `bun run build` | `build.ts` | static SPA in `dist/`, see [Static build](#static-build) |
| `bun start` | `src/index.ts` with `NODE_ENV=production` | Bun server bundling `src/`, not `dist/`; no HMR |

- Use `oxlint` and `oxfmt` instead of `eslint` or `prettier`. Lint config is `.oxlintrc.json`.
- Use `bun check` instead of `tsc --noEmit`. `bun check src/App.tsx` checks one file and what it imports.
- Use `bun test` instead of `jest` or `vitest`.
- Don't add `vite`, `webpack`, or `esbuild`. Bun bundles everything.

## Frontend stack

- React 19 + TypeScript, served by `Bun.serve()` with HTML imports. `src/index.html` loads `src/frontend.tsx`, which renders `App` from `src/App.tsx`.
- `src/index.ts` serves the SPA for every route and forwards `/api/*` to Django on `localhost:8000`. Call the API with the axios instance in `@/lib/api` (`api.get("/items/")` hits `/api/items/`), not `fetch` or the full Django URL. Don't add API routes or database access (`bun:sqlite`, `Bun.sql`, `Bun.redis`) to the Bun server; build endpoints in Django.
- Tailwind CSS v4 via `bun-plugin-tailwind` (configured in `bunfig.toml`). There is no `tailwind.config.js`; theme tokens and dark mode live in `styles/globals.css`. Use the theme tokens (`bg-background`, `text-muted-foreground`, ...) instead of raw colors.
- shadcn/ui (new-york style, lucide icons) in `src/components/ui/`. Use the existing components (`Button`, `Card`, `Input`, `Label`, `Select`, `Textarea`) before writing new ones. Add more with `bunx shadcn@latest add <component>`; don't write them by hand.
- Merge class names with `cn()` from `@/lib/utils`.
- Import from `src/` with the `@/` alias, e.g. `import { Button } from "@/components/ui/button"`.
- Only env vars prefixed `BUN_PUBLIC_` are inlined into the browser bundle. Never put secrets in them.

## Frontend layout

```
build.ts              static production build into dist/
src/index.ts          Bun dev server: SPA + /api proxy
src/index.html        HTML entry; set the page title here
src/frontend.tsx      React root
src/App.tsx           top-level component
src/components/ui/    shadcn/ui components
src/lib/utils.ts      cn()
src/lib/api.ts        axios instance for /api/*
styles/globals.css    Tailwind + shadcn theme
tests/                bun tests; setup.ts registers happy-dom
```

## Frontend testing

Use `bun run test`. `tests/setup.ts` (preloaded via `bunfig.toml`) registers happy-dom and cleans up Testing Library after each test. Query by role or label with `@testing-library/react`, and simulate input with `@testing-library/user-event`.

```tsx#tests/App.test.tsx
import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { App } from "@/App";

test("renders the heading", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "App" })).toBeTruthy();
});
```

## Static build

`bun run build` writes a self-contained client-side SPA to `dist/`: `index.html` plus hashed JS, CSS and assets, minified, with linked sourcemaps. It needs no Bun server at runtime, so any static host can serve it (nginx, Caddy, S3, Netlify, ...).

- The host must serve `index.html` for any path that isn't a file (SPA fallback), so client-side routes survive a reload or deep link.
- Asset URLs are absolute (`publicPath: "/"` in `build.ts`), so the app must live at the domain root. To host it under a subpath, change `publicPath`.
- The `/api/*` proxy exists only in `src/index.ts`. In production, serve `dist/` and Django from the same origin, with `/api/` and `/admin/` routed to Django. API calls stay same-origin, so you don't need CORS or cross-site CSRF setup.
- `BUN_PUBLIC_*` env vars are inlined at build time, the same as in dev. Changing one means rebuilding.
- Hashed files can be cached forever; `index.html` must not be cached.

For more on Bun's APIs, read `frontend/node_modules/bun-types/docs/**.mdx`.
